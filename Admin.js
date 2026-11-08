const express = require('express');
const { db, publicUser } = require('../db');
const { auth, requireRole } = require('../middleware_auth');
const router = express.Router();

// Barcha route lar Admin/CEO uchun, CEO ruxsatlarni tekshiradi
router.use(auth, requireRole('admin', 'ceo'));

// GET /api/admin/users - email bilan, audit log yoziladi
router.get('/users', (req, res) => {
  db.auditLogs.push({ id: Date.now(), who: req.user.email, action: 'View users list', createdAt: new Date().toISOString() });
  res.json(db.users.map(u => ({ ...u, password: undefined })));
});

// POST /api/admin/users/:id/role
router.post('/users/:id/role', (req, res) => {
  const u = db.users.find(x => x.id === req.params.id);
  u.role = req.body.role;
  res.json({ ok: true, user: publicUser(u) });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  db.users = db.users.filter(x => x.id !== req.params.id);
  res.json({ ok: true });
});

// GET /api/admin/payments - Cheklar
router.get('/payments', (req, res) => res.json(db.payments));

// POST /api/admin/message/:userId - Adminga yozish javobi
router.post('/message/:userId', (req, res) => {
  db.messages.push({ id: Date.now(), from: req.user.id, to: req.params.userId, text: req.body.text, createdAt: new Date().toISOString() });
  res.json({ ok: true });
});

// GET /api/admin/messages
router.get('/messages', (req, res) => res.json(db.messages));

module.exports = router;
