import { Request, Response } from "express";
import Meeting from "../models/Meeting";
import Log from "../models/Log";
import transporter from "../config/mailer";
import { sendMailToParticipants } from "../utils/mailHelper";


// ✅ Toplantı oluştur
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { title, description, startDate, endDate, participants } = req.body;
    const document = req.file ? req.file.filename : undefined;

    const meeting = await Meeting.create({
      title,
      description,
      startDate,
      endDate,
      document,
      status: "active",
      participants, // 👈 email listesi (virgüllerle ayrılmış string)
    });

    // 📧 Katılımcılara mail gönder
    await sendMailToParticipants(
      participants,
      `Yeni Toplantı: ${title}`,
      `
        <h3>Yeni Toplantı</h3>
        <p><b>Başlangıç:</b> ${startDate}</p>
        <p><b>Bitiş:</b> ${endDate}</p>
        <p><b>Açıklama:</b> ${description || "Yok"}</p>
      `
    );

    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ message: "Toplantı oluşturulamadı", error: err });
  }
};

// ✅ Tüm toplantıları listele
export const getMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await Meeting.findAll();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Toplantılar getirilemedi", error: err });
  }
};

// ✅ Tek toplantı getir
export const getMeeting = async (req: Request, res: Response) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Toplantı bulunamadı" });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: "Toplantı getirilemedi", error: err });
  }
};

// ✅ Güncelle
export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Toplantı bulunamadı" });

    const { title, description, startDate, endDate, status } = req.body;
    if (req.file) meeting.document = req.file.filename;

    meeting.title = title || meeting.title;
    meeting.description = description || meeting.description;
    meeting.startDate = startDate || meeting.startDate;
    meeting.endDate = endDate || meeting.endDate;
    meeting.status = status || meeting.status;

    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: "Toplantı güncellenemedi", error: err });
  }
};

// ✅ Sil (tamamen kaldır + mail gönder + log)
export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Toplantı bulunamadı" });

    const { title, startDate, endDate, description, participants } = meeting;

    await meeting.destroy();

    // 📧 Katılımcılara mail gönder
    await sendMailToParticipants(
      participants,
      `Toplantı Silindi: ${title}`,
      `
        <h3>Toplantı Silindi</h3>
        <p><b>Başlangıç:</b> ${startDate}</p>
        <p><b>Bitiş:</b> ${endDate}</p>
        <p><b>Açıklama:</b> ${description || "Yok"}</p>
      `
    );

    res.json({ message: "Toplantı silindi ve katılımcılara mail gönderildi" });
  } catch (err) {
    res.status(500).json({ message: "Toplantı silinemedi", error: err });
  }
};

// ✅ İptal et (status = cancelled)
export const cancelMeeting = async (req: Request, res: Response) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Toplantı bulunamadı" });

    meeting.status = "cancelled";
    await meeting.save();

    // 📧 Katılımcılara mail gönder
    await sendMailToParticipants(
      meeting.participants,
      `Toplantı İptal Edildi: ${meeting.title}`,
      `
        <h3>Toplantı İptal Edildi</h3>
        <p><b>Başlangıç:</b> ${meeting.startDate}</p>
        <p><b>Bitiş:</b> ${meeting.endDate}</p>
        <p><b>Açıklama:</b> ${meeting.description || "Yok"}</p>
      `
    );

    res.json({ message: "Toplantı iptal edildi ve katılımcılara mail gönderildi", meeting });
  } catch (err) {
    res.status(500).json({ message: "Toplantı iptal edilemedi", error: err });
  }
};