const express = require('express');
const { db } = require('../db');
const { auth } = require('../middleware_auth');
const router = express.Router();

// GET /api/coin/balance
router.get('/balance', auth, (req, res) => {
  const u = db.users.find(x => x.id === req.user.id);
  res.json({ coins: u.coins, balance: u.balance, rate: 1000 });
});

// POST /api/coin/exchange - 1000 coin = 1$
router.post('/exchange', auth, (req, res) => {
  const u = db.users.find(x => x.id === req.user.id);
  const { coins } = req.body;
  if (coins > u.coins) return res.status(400).json({ error: 'Coin yetarli emas' });
  if (coins < 1000) return res.status(400).json({ error: 'Kamida 1000 coin' });
  const dollars = coins / 1000;
  u.coins -= coins; u.balance += dollars;
  res.json({ ok: true, coins: u.coins, balance: u.balance, exchanged: dollars });
});

// POST /api/coin/donate - Jonli efir donat
router.post('/donate', auth, (req, res) => {
  const { toUserId, amount, type } = req.body;
  const from = db.users.find(x => x.id === req.user.id);
  const to = db.users.find(x => x.id === toUserId);
  if (type === 'coin' && amount > from.coins) return res.status(400).json({ error: 'Coin yetarli emas' });
  if (type === 'coin') { from.coins -= amount; to.coins += amount; }
  else { if (amount > from.balance) return res.status(400).json({ error: 'Balans yetarli emas' }); from.balance -= amount; to.balance += amount; }
  db.notifications.push({ id: Date.now(), userId: to.id, type: 'donate', text: `${from.name} sizga ${amount} ${type} donat qildi!` });
  res.json({ ok: true });
});

// POST /api/coin/spin - Omadli Gildirak, kuniga 1 marta
router.post('/spin', auth, (req, res) => {
  const u = db.users.find(x => x.id === req.user.id);
  const today = new Date().toDateString();
  if (u.lastSpin === today) return res.status(400).json({ error: 'Bugun allaqachon aylantirdingiz! Ertaga yana.' });
  const prizes = [10, 50, 100, 500, 0, 20, 0, 100];
  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  u.coins += prize; u.lastSpin = today;
  res.json({ ok: true, prize, coins: u.coins });
});

module.exports = router;
