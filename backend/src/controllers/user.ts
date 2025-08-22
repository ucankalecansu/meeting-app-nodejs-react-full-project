import { Request, Response } from "express";
import User from "../models/User";

// Tüm kullanıcıları listele
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "firstName", "lastName", "email", "phone", "profileImage"],
      order: [["firstName", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Kullanıcılar getirilemedi", error: err });
  }
};
