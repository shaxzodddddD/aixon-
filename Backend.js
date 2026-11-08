const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./db');
const { security, apiLimiter } = require('./middleware_security');
const { initTables } = require('./db_postgres');
const { startJobs } = require('./jobs');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const paymentRoutes = require('./routes/payments');
const coinRoutes = require('./routes/coin');
const adminRoutes = require('./routes/admin');
const ceoRoutes = require('./routes/ceo');
const searchRoutes = require('./routes/search_analytics');
const uploadRoutes = require('./routes/upload_notifications');

const app = express();
app.set('trust proxy', 1);
app.use(security);
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiLimiter);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coin', coinRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ceo', ceoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'AXIOM', version: '3.0.0', users: db.users.length, posts: db.posts.length, uptime: process.uptime() }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server xatosi' }); });

const PORT = process.env.PORT || 3000;
initTables().then(() => startJobs());
app.listen(PORT, () => console.log('AXIOM Backend v3 running on ' + PORT));
module.exports = app;
