const express = require('express');
const { db } = require('../db');
const { auth } = require('../middleware_auth');
const { upload, uploadToS3 } = require('../upload_s3');
const router = express.Router();

// POST /api/upload/image - Rasm yuklash -> S3 URL qaytaradi
router.post('/image', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fayl kerak' });
  const r = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
  res.json({ ok: true, url: r.url });
});

// POST /api/upload/video - Video yuklash
router.post('/video', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Video kerak' });
  const r = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
  res.json({ ok: true, url: r.url });
});

// GET /api/notifications - Mening bildirishnomalarim
router.get('/', auth, (req, res) => {
  res.json(db.notifications.filter(n => n.userId === req.user.id).slice(-50).reverse());
});

// POST /api/notifications/read-all
router.post('/read-all', auth, (req, res) => {
  db.notifications.forEach(n => { if (n.userId === req.user.id) n.read = true; });
  res.json({ ok: true });
});

module.exports = router;
