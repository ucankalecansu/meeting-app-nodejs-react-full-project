import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";
import transporter from "../config/mailer";

dotenv.config();

export const register = async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, phone, password } = req.body;
      const profileImage = req.file ? req.file.filename : undefined;
  
      // Email kontrol
      const exist = await User.findOne({ where: { email } });
      if (exist) return res.status(400).json({ message: "Email zaten kayıtlı" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        profileImage,
      });
  
      // 📧 Hoş geldin maili gönder
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "MeetingApp'e Hoş Geldiniz 🎉",
        html: `
          <h2>Merhaba ${firstName} ${lastName},</h2>
          <p>MeetingApp'e kayıt olduğunuz için teşekkür ederiz.</p>
          <p>Artık toplantılarınızı kolayca oluşturabilir, yönetebilir ve takip edebilirsiniz.</p>
          <br/>
          <p>🚀 Keyifli kullanımlar!</p>
        `,
      });
  
      return res.status(201).json({ message: "Kayıt başarılı, hoş geldin maili gönderildi", user });
    } catch (err) {
      return res.status(500).json({ message: "Kayıt sırasında hata", error: err });
    }
  };

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Şifre hatalı" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({ message: "Giriş başarılı", token });
  } catch (err) {
    return res.status(500).json({ message: "Giriş sırasında hata", error: err });
  }
};
