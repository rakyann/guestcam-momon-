import http from 'http';
import https from 'https';

/**
 * 🚀 SATUFOTO / COBAQR - LOAD & STRESS TEST SCRIPT (1,200 USERS)
 * 
 * Simulated Scenario:
 * - 1,200 unique event guests visiting the app simultaneously.
 * - Each guest fetches the shared gallery feed.
 * - Each guest posts a photo + wish to the collective album.
 * - Reports detailed metrics: RPS, Latency, Error Rate, and Success Rate.
 */

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:5173';
const TOTAL_USERS = 1200;
const BATCH_SIZE = 50; // 50 concurrent requests per batch to simulate real network burst
const EVENT_ID = 'riztiana-rizky';

console.log(`\n==================================================`);
console.log(`🔥 STARTING LOAD & STRESS TEST FOR ${TOTAL_USERS} USERS`);
console.log(`🎯 Target URL: ${TARGET_URL}`);
console.log(`📦 Batch Size: ${BATCH_SIZE} concurrent users per wave`);
console.log(`==================================================\n`);

const sampleWishes = [
  "Selamat ya! Semoga langgeng selamanya 🎉",
  "Happy wedding! Best wishes for you both ✨",
  "Selamat menempuh hidup baru! 🥳",
  "Fotonya bagus bgt! Congrats! ❤️",
  "Semoga bahagia selamanya, murni dan abadi! 🥂",
  "Momen terindah! Sukses selalu! 📸"
];

// Sample 1x1 base64 transparent PNG for lightweight payload testing
const SAMPLE_BASE64_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

let stats = {
  total: 0,
  success: 0,
  failed: 0,
  getSuccess: 0,
  postSuccess: 0,
  totalLatencyMs: 0,
  minLatencyMs: Infinity,
  maxLatencyMs: 0,
  startTime: Date.now()
};

function makeRequest(url, method, payload = null) {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SatuFoto-LoadTest-Agent/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const latency = Date.now() - start;
        const isOk = res.statusCode >= 200 && res.statusCode < 300;
        resolve({ ok: isOk, statusCode: res.statusCode, latency, body });
      });
    });

    req.on('error', (err) => {
      const latency = Date.now() - start;
      resolve({ ok: false, statusCode: 500, latency, error: err.message });
    });

    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

async function simulateUserSession(userId) {
  const guestName = `Tamu #${userId + 1}`;
  const wish = sampleWishes[userId % sampleWishes.length];

  // Step 1: Guest fetches gallery
  const getRes = await makeRequest(`${TARGET_URL}/api/photos?eventId=${EVENT_ID}`, 'GET');
  if (getRes.ok) stats.getSuccess++;

  // Step 2: Guest posts photo entry
  const postPayload = {
    id: `photo_test_${Date.now()}_${userId}`,
    eventId: EVENT_ID,
    guestName: guestName,
    wish: wish,
    imageUrl: SAMPLE_BASE64_IMAGE,
    presetId: 'portra400',
    timestamp: new Date().toISOString()
  };

  const postRes = await makeRequest(`${TARGET_URL}/api/photos?eventId=${EVENT_ID}`, 'POST', postPayload);
  if (postRes.ok) stats.postSuccess++;

  const userOk = getRes.ok || postRes.ok;
  const avgLatency = (getRes.latency + postRes.latency) / 2;

  stats.total++;
  if (userOk) stats.success++;
  else stats.failed++;

  stats.totalLatencyMs += avgLatency;
  if (avgLatency < stats.minLatencyMs) stats.minLatencyMs = avgLatency;
  if (avgLatency > stats.maxLatencyMs) stats.maxLatencyMs = avgLatency;
}

async function runLoadTest() {
  const totalBatches = Math.ceil(TOTAL_USERS / BATCH_SIZE);
  
  for (let b = 0; b < totalBatches; b++) {
    const batchStart = b * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_USERS);
    const promises = [];

    for (let i = batchStart; i < batchEnd; i++) {
      promises.push(simulateUserSession(i));
    }

    await Promise.all(promises);

    const progressPct = Math.round((stats.total / TOTAL_USERS) * 100);
    process.stdout.write(`\r⏳ Progress: [${progressPct}%] (${stats.total}/${TOTAL_USERS} Tamu terproses...)`);
  }

  const durationSec = (Date.now() - stats.startTime) / 1000;
  const avgLatency = stats.total > 0 ? (stats.totalLatencyMs / stats.total).toFixed(2) : 0;
  const rps = (stats.total / durationSec).toFixed(2);

  console.log(`\n\n==================================================`);
  console.log(`📊 LAPORAN HASIL LOAD TEST (1,200 USER)`);
  console.log(`==================================================`);
  console.log(`⏱️ Total Waktu        : ${durationSec.toFixed(2)} detik`);
  console.log(`👥 Total Tamu         : ${stats.total} User`);
  console.log(`✅ Berhasil           : ${stats.success} User (${((stats.success / TOTAL_USERS) * 100).toFixed(1)}%)`);
  console.log(`❌ Gagal              : ${stats.failed} User`);
  console.log(`📥 GET Gallery Success: ${stats.getSuccess} requests`);
  console.log(`📤 POST Photo Success : ${stats.postSuccess} requests`);
  console.log(`⚡ Rata-rata Latensi   : ${avgLatency} ms`);
  console.log(`🏎️ Min/Max Latensi    : ${stats.minLatencyMs === Infinity ? 0 : stats.minLatencyMs} ms / ${stats.maxLatencyMs} ms`);
  console.log(`🔥 Throughput (RPS)   : ${rps} req/sec`);
  console.log(`==================================================\n`);
}

runLoadTest();
