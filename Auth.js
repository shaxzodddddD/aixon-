const express = require('express');
const bcrypt = require('bcryptjs');
const { db, publicUser } = require('../db');
const { signToken } = require('../middleware_auth');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, username, email, phone, password, referralCode } = req.body;
  if (!name || !username || !email || !password) return res.status(400).json({ error: 'Hamma maydonni toldiring' });
  if (password.length < 6) return res.status(400).json({ error: 'Parol kamida 6 ta bolsin' });
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Bu email allaqachon royxatdan otgan' });
  if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'Username band' });
  if (phone && !/^\+998\d{9}$/.test(phone)) return res.status(400).json({ error: 'Telefon +998XXXXXXXXX formatda bolsin' });

  const hash = await bcrypt.hash(password, 10);
  const user = { id: 'u' + Date.now(), name, username, email, phone: phone || '', password: hash, role: 'user', coins: 100, balance: 0, subscription: null, subExpiry: null, referralCode: 'AXIOM-' + username.toUpperCase(), invitedBy: null, privacy: { email: 'me', phone: 'me', balance: 'me', coins: 'friends' }, createdAt: new Date().toISOString() };

  // Referal 2X Bonus
  if (referralCode) {
    const inviter = db.users.find(u => u.referralCode === referralCode);
    if (inviter) {
      inviter.coins += 200; user.coins += 100; user.invitedBy = inviter.id;
      db.referrals.push({ id: Date.now(), inviterId: inviter.id, invitedId: user.id, bonusInviter: 200, bonusInvited: 100, createdAt: new Date().toISOString() });
    }
  }
  // 500K Marathon bonus
  user.coins += 200;
  db.users.push(user);
  const token = signToken(user);
  res.json({ ok: true, token, user: publicUser(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email || u.username === email);
  if (!user) return res.status(404).json({ error: 'User topilmadi' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Parol xato' });
  // Daily login +10 coin
  user.coins += 10;
  res.json({ ok: true, token: signToken(user), user: publicUser(user) });
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User topilmadi' });
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) return res.status(401).json({ error: 'Eski parol xato' });
  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ ok: true, message: 'Parol ozgartirildi' });
});

module.exports = router;
