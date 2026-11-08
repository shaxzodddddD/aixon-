// AXIOM S3 Upload - Rasm / Video / Chek yuklash
// AWS S3: fayllar serverda emas, S3 da saqlanadi - 500K user uchun shart
const multer = require('multer');
const upload = multer({ limits: { fileSize: 20 * 1024 * 1024 }, storage: multer.memoryStorage() });

async function uploadToS3(buffer, filename, mimetype) {
  if (!process.env.AWS_S3_BUCKET) {
    // Dev rejim: faylni local ga yozmasdan base64 qaytaramiz
    return { url: 'data:' + mimetype + ';base64,' + buffer.toString('base64').slice(0, 100), mock: true };
  }
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });
  const key = 'uploads/' + Date.now() + '-' + filename;
  await s3.send(new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key, Body: buffer, ContentType: mimetype }));
  return { url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}` };
}

module.exports = { upload, uploadToS3 };
