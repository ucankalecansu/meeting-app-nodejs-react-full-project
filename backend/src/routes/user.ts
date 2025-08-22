import { Router } from "express";
import { getUsers } from "../controllers/user";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Sistem kullanıcıları
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Tüm kullanıcıları listele
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", authMiddleware, getUsers);

export default router;
