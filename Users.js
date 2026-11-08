const express = require('express');
const { db, publicUser } = require('../db');
const { auth } = require('../middleware_auth');
const router = express.Router();

// GET /api/users/me
router.get('/me', auth, (req, res) => {
  const u = db.users.find(x => x.id === req.user.id);
  res.json(publicUser(u));
});

// GET /api/users/search?q=
router.get('/search', auth, (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const list = db.users.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)).map(publicUser);
  res.json(list);
});

// GET /api/users/:id - maxfiylik hurmat qilinadi
router.get('/:id', auth, (req, res) => {
  const u = db.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Topilmadi' });
  res.json(publicUser(u));
});

// PUT /api/users/privacy - Maxfiylik sozlamalari
router.put('/privacy', auth, (req, res) => {
  const u = db.users.find(x => x.id === req.user.id);
  u.privacy = { ...u.privacy, ...req.body };
  res.json({ ok: true, privacy: u.privacy });
});

// POST /api/users/:id/friend-request
router.post('/:id/friend-request', auth, (req, res) => {
  const target = db.users.find(x => x.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Topilmadi' });
  db.notifications.push({ id: Date.now(), userId: target.id, fromId: req.user.id, type: 'friend_request', text: 'Sizga dostlik sorovi keldi', createdAt: new Date().toISOString() });
  res.json({ ok: true, message: 'Dostlik sorovi yuborildi' });
});

// POST /api/users/:id/block
router.post('/:id/block', auth, (req, res) => {
  res.json({ ok: true, message: 'User bloklandi' });
});

module.exports = router;
