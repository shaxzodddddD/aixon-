const express = require('express');
const { db } = require('../db');
const { auth, requireRole } = require('../middleware_auth');
const router = express.Router();

const PLANS = { Plus: 49, Pro: 99, Elite: 149, 'Elite Pro': 299 };

// POST /api/payments/subscribe - Chek yuborish
router.post('/subscribe', auth, (req, res) => {
  const { plan, senderName, senderLast4, checkId, checkImageUrl, note } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Plan xato' });
  const user = db.users.find(u => u.id === req.user.id);
  const p = { id: Date.now(), userId: user.id, userName: user.name, userEmail: user.email, plan, amount: PLANS[plan], senderName, senderLast4, checkId, checkImageUrl, note, status: 'Kutilmoqda', createdAt: new Date().toISOString() };
  db.payments.push(p);
  res.json({ ok: true, payment: p, message: 'Chek yuborildi! Admin tasdiqlagandan keyin obuna beriladi.' });
});

// GET /api/payments/mine
router.get('/mine', auth, (req, res) => res.json(db.payments.filter(p => p.userId === req.user.id)));

// POST /api/payments/:id/approve - Admin/CEO
router.post('/:id/approve', auth, requireRole('admin', 'ceo'), (req, res) => {
  const p = db.payments.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ error: 'Topilmadi' });
  p.status = 'Tasdiqlandi';
  const user = db.users.find(u => u.id === p.userId);
  user.subscription = p.plan;
  user.subExpiry = new Date(Date.now() + 30*24*60*60*1000).toISOString();
  db.notifications.push({ id: Date.now(), userId: user.id, type: 'subscription', text: `Obunangiz tasdiqlandi! ${p.plan} - 30 kun` });
  db.auditLogs.push({ id: Date.now(), who: req.user.email, action: 'Payment approve', target: user.email, createdAt: new Date().toISOString() });
  res.json({ ok: true, payment: p });
});

// POST /api/payments/:id/reject
router.post('/:id/reject', auth, requireRole('admin', 'ceo'), (req, res) => {
  const p = db.payments.find(x => x.id == req.params.id);
  p.status = 'Rad etildi'; p.rejectReason = req.body.reason || '';
  const user = db.users.find(u => u.id === p.userId);
  db.notifications.push({ id: Date.now(), userId: user.id, type: 'payment_reject', text: `Tolovingiz rad etildi: ${p.rejectReason}` });
  res.json({ ok: true, payment: p });
});

// GET /api/payments/all - Admin/CEO
router.get('/all', auth, requireRole('admin', 'ceo'), (req, res) => res.json(db.payments));

// POST /api/payments/withdraw - Pul yechish
router.post('/withdraw', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  const { amount, cardNumber } = req.body;
  if (amount > user.balance) return res.status(400).json({ error: 'Balans yetarli emas' });
  const w = { id: Date.now(), userId: user.id, userName: user.name, userEmail: user.email, amount, cardNumber, status: 'Kutilmoqda', createdAt: new Date().toISOString() };
  db.withdrawals.push(w);
  user.balance -= amount; // Vaqtincha ushlab turiladi
  res.json({ ok: true, withdrawal: w });
});

module.exports = router;
