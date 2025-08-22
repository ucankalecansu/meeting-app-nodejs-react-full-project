import { Router } from "express";
import multer from "multer";
import {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  cancelMeeting,
} from "../controllers/meeting";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Multer config (doküman upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Yeni toplantı oluştur
 *     description: Başlık, açıklama, başlangıç/bitiş tarihi ve döküman ile toplantı oluşturma
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Toplantı başarıyla oluşturuldu
 *       500:
 *         description: Sunucu hatası
 */
router.post("/", authMiddleware, upload.single("document"), createMeeting);

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: Tüm toplantıları listele
 *     description: Sistemdeki tüm toplantıların listesi
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toplantılar başarıyla listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get("/", authMiddleware, getMeetings);

/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     summary: Toplantı detaylarını getir
 *     description: ID ile belirtilen toplantının detaylarını getirir
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Toplantı ID
 *     responses:
 *       200:
 *         description: Toplantı detayları
 *       404:
 *         description: Toplantı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get("/:id", authMiddleware, getMeeting);

/**
 * @swagger
 * /api/meetings/{id}:
 *   put:
 *     summary: Toplantı güncelle
 *     description: ID ile belirtilen toplantının bilgilerini günceller
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Toplantı ID
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, cancelled]
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Toplantı başarıyla güncellendi
 *       404:
 *         description: Toplantı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put("/:id", authMiddleware, upload.single("document"), updateMeeting);

/**
 * @swagger
 * /api/meetings/{id}:
 *   delete:
 *     summary: Toplantıyı sil
 *     description: ID ile belirtilen toplantıyı veritabanından tamamen siler
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Toplantı ID
 *     responses:
 *       200:
 *         description: Toplantı başarıyla silindi
 *       404:
 *         description: Toplantı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete("/:id", authMiddleware, deleteMeeting);

/**
 * @swagger
 * /api/meetings/{id}/cancel:
 *   patch:
 *     summary: Toplantıyı iptal et
 *     description: ID ile belirtilen toplantıyı iptal eder (silmeden durum değişikliği)
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Toplantı ID
 *     responses:
 *       200:
 *         description: Toplantı başarıyla iptal edildi
 *       404:
 *         description: Toplantı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.patch("/:id/cancel", authMiddleware, cancelMeeting);

export default router;
