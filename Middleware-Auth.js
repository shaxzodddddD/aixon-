const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'axiom-secret-2026-change-in-production';

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
}
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token kerak' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch (e) { return res.status(401).json({ error: 'Token yaroqsiz' }); }
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Ruxsat yoq' });
    next();
  };
}
module.exports = { signToken, auth, requireRole, SECRET };
