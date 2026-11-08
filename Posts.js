const express = require('express');
const { db } = require('../db');
const { auth } = require('../middleware_auth');
const router = express.Router();

router.get('/', (req, res) => res.json(db.posts));
router.post('/', auth, (req, res) => {
  const { text, type, mediaUrl, channelId } = req.body;
  if (!text && !mediaUrl) return res.status(400).json({ error: 'Matn yoki media kerak' });
  const user = db.users.find(u => u.id === req.user.id);
  const post = { id: Date.now(), authorId: user.id, author: user.name, username: user.username, text, type: type || 'text', mediaUrl: mediaUrl || '', channelId: channelId || null, likes: 0, comments: [], createdAt: new Date().toISOString() };
  db.posts.unshift(post);
  user.coins += 5; // Post uchun +5 coin
  res.json(post);
});
router.post('/:id/like', auth, (req, res) => {
  const p = db.posts.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ error: 'Topilmadi' });
  p.likes += 1;
  const author = db.users.find(u => u.id === p.authorId);
  if (author) author.coins += 2; // Like olgan odamga +2 coin
  res.json({ ok: true, likes: p.likes });
});
router.post('/:id/comment', auth, (req, res) => {
  const p = db.posts.find(x => x.id == req.params.id);
  const user = db.users.find(u => u.id === req.user.id);
  p.comments.push({ id: Date.now(), author: user.name, text: req.body.text, createdAt: new Date().toISOString() });
  res.json(p);
});
router.delete('/:id', auth, (req, res) => {
  const i = db.posts.findIndex(x => x.id == req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Topilmadi' });
  if (db.posts[i].authorId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'ceo') return res.status(403).json({ error: 'Ruxsat yoq' });
  db.posts.splice(i, 1);
  res.json({ ok: true });
});
// Video post
router.post('/video', auth, (req, res) => {
  const { title, videoUrl, coverUrl, description } = req.body;
  if (!videoUrl) return res.status(400).json({ error: 'Video URL kerak' });
  const user = db.users.find(u => u.id === req.user.id);
  const post = { id: Date.now(), authorId: user.id, author: user.name, username: user.username, text: title, type: 'video', mediaUrl: videoUrl, coverUrl, description, likes: 0, comments: [], createdAt: new Date().toISOString() };
  db.posts.unshift(post);
  res.json(post);
});
// Story
router.post('/story', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  const s = { id: Date.now(), authorId: user.id, author: user.name, ...req.body, views: 0, expiresAt: Date.now() + 24*60*60*1000, createdAt: new Date().toISOString() };
  db.stories.unshift(s);
  res.json(s);
});
router.get('/stories/list', (req, res) => res.json(db.stories.filter(s => s.expiresAt > Date.now())));
// Channel
router.post('/channel', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  const c = { id: Date.now(), ownerId: user.id, owner: user.name, subscribers: [], ...req.body, createdAt: new Date().toISOString() };
  db.channels.push(c);
  res.json(c);
});
router.post('/channel/:id/subscribe', auth, (req, res) => {
  const c = db.channels.find(x => x.id == req.params.id);
  if (!c.subscribers.includes(req.user.id)) c.subscribers.push(req.user.id);
  res.json({ ok: true, subscribers: c.subscribers.length });
});
router.get('/channels/list', (req, res) => res.json(db.channels));

module.exports = router;
