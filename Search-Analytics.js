const express = require('express');
const { db } = require('../db');
const { auth } = require('../middleware_auth');
const { cached, cache } = require('../cache');
const router = express.Router();

// GET /api/search?q=&type= - Tez qidiruv (cache bilan)
router.get('/', auth, cached('search', 30), (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const users = db.users.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)).slice(0, 20).map(u => ({ id: u.id, name: u.name, username: u.username }));
  const posts = db.posts.filter(p => (p.text || '').toLowerCase().includes(q)).slice(0, 20);
  const channels = db.channels.filter(c => (c.name || '').toLowerCase().includes(q));
  res.json({ users, posts, channels });
});

// GET /api/analytics/growth - CEO uchun o'sish
router.get('/growth', auth, (req, res) => {
  if (req.user.role !== 'ceo' && req.user.role !== 'admin') return res.status(403).json({ error: 'Ruxsat yoq' });
  const byDay = {};
  db.users.forEach(u => { const d = new Date(u.createdAt).toISOString().slice(0, 10); byDay[d] = (byDay[d] || 0) + 1; });
  res.json({ totalUsers: db.users.length, totalPosts: db.posts.length, totalPayments: db.payments.length, revenue: db.payments.filter(p => p.status === 'Tasdiqlandi').reduce((s, p) => s + p.amount, 0), byDay, topInviters: [...db.users].sort((a, b) => (b.invites || 0) - (a.invites || 0)).slice(0, 10).map(u => ({ name: u.name, invites: u.invites || 0 })) });
});

module.exports = router;
