// AXIOM Background Jobs - Har kuni / har soatda ishlaydi
// Render Cron yoki AWS EventBridge da ishlatish mumkin
const { db } = require('./db');

function expireStories() {
  const before = db.stories.length;
  db.stories = db.stories.filter(s => s.expiresAt > Date.now());
  if (before !== db.stories.length) console.log('Expired stories cleaned:', before - db.stories.length);
}
function expireSubscriptions() {
  const now = new Date().toISOString();
  db.users.forEach(u => {
    if (u.subscription && u.subExpiry && u.subExpiry < now) {
      u.subscription = null; u.subExpiry = null;
      db.notifications.push({ id: Date.now(), userId: u.id, type: 'sub_expired', text: 'Obunangiz tugadi. Yangilash uchun Premium ga kiring.' });
    }
  });
}
function dailyBonus() {
  // Har kuni 00:00 da streak yangilanadi - hozircha log
  console.log('Daily job: subscriptions + stories checked at', new Date().toISOString());
}
function startJobs() {
  setInterval(expireStories, 60 * 60 * 1000); // har soat
  setInterval(expireSubscriptions, 60 * 60 * 1000);
  setInterval(dailyBonus, 24 * 60 * 60 * 1000);
  console.log('Background jobs started');
}
module.exports = { startJobs, expireStories, expireSubscriptions };
