const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { auth, requireRole } = require('../middleware_auth');
const router = express.Router();

router.use(auth, requireRole('ceo'));

// GET /api/ceo/dashboard - Kunlik Dashboard
router.get('/dashboard', (req, res) => {
  const today = new Date().toDateString();
  const todayUsers = db.users.filter(u => new Date(u.createdAt).toDateString() === today).length;
  const todayPayments = db.payments.filter(p => new Date(p.createdAt).toDateString() === today);
  const revenue = db.payments.filter(p => p.status === 'Tasdiqlandi').reduce((s, p) => s + p.amount, 0);
  res.json({ totalUsers: db.users.length, todayUsers, todayPayments: todayPayments.length, revenue, pendingPayments: db.payments.filter(p => p.status === 'Kutilmoqda').length, pendingWithdrawals: db.withdrawals.filter(w => w.status === 'Kutilmoqda').length, auditLogs: db.auditLogs.slice(-20) });
});

// POST /api/ceo/card - CEO kartasi qoshish
router.post('/card', (req, res) => {
  const { holder, number, bank, expiry } = req.body;
  if (!/^\d{16}$/.test(number.replace(/\s/g, ''))) return res.status(400).json({ error: 'Karta 16 raqamli bolsin' });
  const card = { id: Date.now(), holder, number, bank, expiry, active: true, createdAt: new Date().toISOString() };
  if (!db.ceoCards) db.ceoCards = [];
  db.ceoCards.forEach(c => c.active = false);
  db.ceoCards.push(card);
  res.json({ ok: true, card });
});
router.get('/cards', (req, res) => res.json(db.ceoCards || []));

// POST /api/ceo/admin - Yangi Admin yaratish
router.post('/admin', async (req, res) => {
  const { name, email, password, permissions } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const admin = { id: 'a' + Date.now(), name, email, password: hash, role: 'admin', permissions: permissions || {}, coins: 0, balance: 0, createdAt: new Date().toISOString() };
  db.users.push(admin);
  res.json({ ok: true, admin: { ...admin, password: undefined } });
});

// POST /api/ceo/withdraw/:id/approve
router.post('/withdraw/:id/approve', (req, res) => {
  const w = db.withdrawals.find(x => x.id == req.params.id);
  w.status = 'Tolandi';
  res.json({ ok: true, withdrawal: w });
});

// POST /api/ceo/give-subscription - Bepul obuna berish
router.post('/give-subscription', (req, res) => {
  const u = db.users.find(x => x.id === req.body.userId);
  u.subscription = req.body.plan; u.subExpiry = new Date(Date.now() + 30*24*60*60*1000).toISOString();
  res.json({ ok: true, user: u });
});

module.exports = router;
