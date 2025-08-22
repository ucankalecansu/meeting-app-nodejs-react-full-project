import { Request, Response } from "express";
import Meeting from "../models/Meeting";
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
      participants, //  email listesi
    });

    // Katılımcılara mail gönder
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

    // Eski değerleri hatırla (mail ve geri dönüş için)
    const old = {
      title: meeting.title,
      description: meeting.description,
      startDate: meeting.startDate,
      endDate: meeting.endDate,
      participants: meeting.participants,
      status: meeting.status,
      document: meeting.document,
    };

    const {
      title,
      description,
      startDate,
      endDate,
      participants,
      status,
    } = req.body;

    const document = req.file ? req.file.filename : undefined;

    if (typeof title !== "undefined") meeting.title = title;
    if (typeof description !== "undefined") meeting.description = description;
    if (typeof startDate !== "undefined") meeting.startDate = startDate;
    if (typeof endDate !== "undefined") meeting.endDate = endDate;

    if (typeof participants !== "undefined") {
      if (participants.trim() === "") {
        // boş gönderildiyse eski değer kalsın
        // meeting.participants = meeting.participants;
      } else {
        meeting.participants = participants;
      }
    }

    if (typeof status !== "undefined") {
      meeting.status = status;
    }

    if (typeof document !== "undefined") {
      meeting.document = document;
    }

    await meeting.save();

    const mergeEmails = (a?: string | null, b?: string | null) => {
      const toArr = (s?: string | null) =>
        (s || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      const set = new Set([...toArr(a), ...toArr(b)]);
      return Array.from(set).join(",");
    };

    const notifyList = mergeEmails(old.participants, meeting.participants);

    const fmt = (d?: any) => (d ? new Date(d).toLocaleString() : "—");
    const diffRow = (label: string, before?: any, after?: any) => {
      const b = before ?? "—";
      const a = after ?? "—";
      if (String(b) === String(a)) return "";
      return `<tr><td><b>${label}</b></td><td>${b}</td><td>${a}</td></tr>`;
    };

    const rows = [
      diffRow("Başlık", old.title, meeting.title),
      diffRow("Açıklama", old.description, meeting.description),
      diffRow("Başlangıç", fmt(old.startDate), fmt(meeting.startDate)),
      diffRow("Bitiş", fmt(old.endDate), fmt(meeting.endDate)),
      diffRow("Durum", old.status, meeting.status),
      diffRow("Katılımcılar", old.participants, meeting.participants),
      diffRow("Doküman", old.document, meeting.document),
    ]
      .filter(Boolean)
      .join("");

    const html =
      rows.length > 0
        ? `
          <h3>Toplantı Güncellendi: ${meeting.title}</h3>
          <p>Aşağıda yapılan değişikliklerin özeti yer alır:</p>
          <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
            <thead><tr><th>Alan</th><th>Eski</th><th>Yeni</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p><b>Güncel Program:</b> ${fmt(meeting.startDate)} - ${fmt(meeting.endDate)}</p>
        `
        : `
          <h3>Toplantı Güncellendi: ${meeting.title}</h3>
          <p>Toplantıda bir güncelleme yapıldı.</p>
          <p><b>Program:</b> ${fmt(meeting.startDate)} - ${fmt(meeting.endDate)}</p>
        `;

    if (notifyList) {
      await sendMailToParticipants(
        notifyList,
        `Toplantı Güncellendi: ${meeting.title}`,
        html
      );
    }

    // Dönüş: güncel değerler
    res.json({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startDate: meeting.startDate,
      endDate: meeting.endDate,
      document: meeting.document,
      status: meeting.status,
      participants: meeting.participants,
    });
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

    //Katılımcılara mail gönder
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

    // Katılımcılara mail gönder
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