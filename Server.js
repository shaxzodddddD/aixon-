const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
let posts = [
  { id: 1, author: 'Shaxzod Xakimov', user: '@shaxzodx1', text: 'AXIOM ga xush kelibsiz! One Network. Infinite Intelligence.', likes: 268000, comments: 12400, time: '2h ago', tag: '#AXIOM #AIRevolution' },
  { id: 2, author: 'Elon Musk', user: '@elonmusk', text: 'The future is built by dreamers. #AI #Innovation #AXIOM', likes: 45200, comments: 3400, time: '2h ago', tag: '#FutureTech' }
];
app.get('/api/health', (req, res) => res.json({ ok: true, app: 'AXIOM', version: '1.0.0' }));
app.get('/api/posts', (req, res) => res.json(posts));
app.post('/api/posts', (req, res) => { const p = { id: Date.now(), ...req.body, likes: 0, comments: 0, time: 'now' }; posts.unshift(p); res.json(p); });
app.post('/api/register', (req, res) => { res.json({ ok: true, user: { id: Date.now(), ...req.body } }); });
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log('AXIOM running on ' + PORT));
