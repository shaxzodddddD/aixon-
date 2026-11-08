const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// 1. Xavfsizlik sarlavhalari
const security = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
});

// 2. Rate Limit - DDoS / Brute-force dan himoya
const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, message: { error: 'Juda kop urinish. 15 daqiqa kuting.' } });
const apiLimiter = rateLimit({ windowMs: 60*1000, max: 120, message: { error: 'Juda tez sorov. Sekinroq.' } });
const registerLimiter = rateLimit({ windowMs: 60*60*1000, max: 10, message: { error: 'Bir soatda 10 tadan kop royxatdan otib bolmaydi.' } });

// 3. Validatsiya
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Ism kamida 2 ta harf'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username kamida 3 ta'),
  body('email').isEmail().withMessage('Email xato'),
  body('phone').optional().matches(/^\+998\d{9}$/).withMessage('Telefon +998XXXXXXXXX formatda'),
  body('password').isLength({ min: 6 }).withMessage('Parol kamida 6 ta'),
  validate
];

// 4. Audit Log - kim nima qildi
function audit(action) {
  return (req, res, next) => {
    const orig = res.json;
    res.json = function(data) {
      try {
        const { db } = require('../db');
        db.auditLogs.push({ id: Date.now(), who: req.user?.email || 'guest', action, ip: req.ip, path: req.path, status: res.statusCode, createdAt: new Date().toISOString() });
      } catch(e) {}
      return orig.call(this, data);
    };
    next();
  };
}

module.exports = { security, loginLimiter, apiLimiter, registerLimiter, registerValidation, validate, audit };
