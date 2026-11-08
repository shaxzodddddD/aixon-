// AXIOM Cache - Redis o'rniga tez xotira, 500K user uchun
// AWS da: ElastiCache Redis ga almashtiriladi, API bir xil
class Cache {
  constructor() { this.store = new Map(); }
  get(key) {
    const v = this.store.get(key);
    if (!v) return null;
    if (Date.now() > v.exp) { this.store.delete(key); return null; }
    return v.data;
  }
  set(key, data, ttlSec = 60) { this.store.set(key, { data, exp: Date.now() + ttlSec * 1000 }); }
  del(key) { this.store.delete(key); }
  delPrefix(prefix) { for (const k of this.store.keys()) if (k.startsWith(prefix)) this.store.delete(k); }
}
const cache = new Cache();
function cached(key, ttlSec = 60) {
  return (req, res, next) => {
    const hit = cache.get(key + req.originalUrl);
    if (hit) return res.json(hit);
    const orig = res.json;
    res.json = function(data) { cache.set(key + req.originalUrl, data, ttlSec); return orig.call(this, data); };
    next();
  };
}
module.exports = { cache, cached };
