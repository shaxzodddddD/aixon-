// AXIOM DB - PostgreSQL (AWS RDS) ga tayyor
// Agar DATABASE_URL bo'lsa Postgres ishlaydi, bo'lmasa memory (Render Free)
let usePostgres = !!process.env.DATABASE_URL;
let pool = null;
if (usePostgres) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  console.log('PostgreSQL connected (AWS RDS)');
} else {
  console.log('Memory DB (dev) - AWS da DATABASE_URL qoying');
}
async function query(sql, params = []) {
  if (!pool) return null;
  return pool.query(sql, params);
}
async function initTables() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, username TEXT UNIQUE, email TEXT UNIQUE, phone TEXT, password TEXT, role TEXT DEFAULT 'user', coins INT DEFAULT 0, balance NUMERIC DEFAULT 0, subscription TEXT, sub_expiry TIMESTAMPTZ, referral_code TEXT, invited_by TEXT, privacy JSONB, created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS posts (id BIGINT PRIMARY KEY, author_id TEXT, text TEXT, type TEXT, media_url TEXT, likes INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS payments (id BIGINT PRIMARY KEY, user_id TEXT, plan TEXT, amount NUMERIC, status TEXT DEFAULT 'Kutilmoqda', check_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS audit_logs (id BIGINT PRIMARY KEY, who TEXT, action TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
  `);
  console.log('Tables ready');
}
module.exports = { query, initTables, usePostgres };
