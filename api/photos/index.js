import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

function getEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath));
      if (parsed[key]) {
        process.env[key] = parsed[key];
        return parsed[key];
      }
    }
  } catch (e) {}
  return '';
}

if (!global._tuaipandangPhotos) {
  global._tuaipandangPhotos = {};
}

export default async function handler(req, res) {
  const sendJson = (statusCode, data) => {
    if (typeof res.status === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  const eventId = (req.query && req.query.eventId) || 'riztiana-rizky';

  if (req.method === 'GET') {
    if (!global._tuaipandangPhotos[eventId]) {
      global._tuaipandangPhotos[eventId] = [];
    }

    let list = global._tuaipandangPhotos[eventId] || [];

    const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwcgVqgr3UnQqLvvjmcaD2whgAlo-EyTqkJK_TCNoBW2n4_CKLpv25g7ixEjtsaCoX/exec';
    let SCRIPT_URL = getEnv('GOOGLE_SCRIPT_URL') || getEnv('GOOGLE_DRIVE_WEBHOOK_URL') || DEFAULT_SCRIPT_URL;
    if (!SCRIPT_URL || SCRIPT_URL.includes('AKfycbwD0pl-WvHefZEeD1CJGStIllcNBazdvvvyLwLwmvMwBEFR5MIp5GjBfkTDJJI2np6ozw') || SCRIPT_URL.includes('AKfycybWDJFwKWrAMRIyQgk')) {
      SCRIPT_URL = DEFAULT_SCRIPT_URL;
    }
    const FOLDER_ID = getEnv('GOOGLE_DRIVE_FOLDER_ID') || '14ODs7q1sMDOyqybW8J5Mk7qLhw6u29uJ';

    if (SCRIPT_URL) {
      try {
        const syncUrl = `${SCRIPT_URL}?folderId=${FOLDER_ID}`;
        const driveRes = await fetch(syncUrl, { method: 'GET' });
        if (driveRes.ok) {
          const driveData = await driveRes.json();
          if (driveData.success && Array.isArray(driveData.photos)) {
            // Directly synchronize list with current Google Drive contents
            list = driveData.photos;
            global._tuaipandangPhotos[eventId] = list;
          }
        }
      } catch (err) {
        console.warn("Drive sync fetch warning:", err.message);
      }
    }

    return sendJson(200, {
      success: true,
      photos: list
    });
  }

  if (req.method === 'DELETE') {
    global._tuaipandangPhotos[eventId] = [];
    return sendJson(200, {
      success: true,
      message: 'Semua foto uji coba berhasil dihapus'
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || (!body.imageUrl && !body.url)) {
        return sendJson(400, { error: 'Missing photo payload' });
      }

      if (!global._tuaipandangPhotos[eventId]) {
        global._tuaipandangPhotos[eventId] = [];
      }

      const newPhoto = {
        id: body.id || `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        eventId: eventId,
        guestName: body.guestName || body.guestSessionId || 'Tamu Acara',
        wish: body.wish || body.caption || '',
        imageUrl: body.imageUrl || body.url,
        driveFileId: body.driveFileId || null,
        presetId: body.presetId || 'portra400',
        likes: body.likes || 0,
        timestamp: body.timestamp || new Date().toISOString()
      };

      global._tuaipandangPhotos[eventId].unshift(newPhoto);

      return sendJson(200, {
        success: true,
        photo: newPhoto,
        photos: global._tuaipandangPhotos[eventId]
      });
    } catch (err) {
      return sendJson(500, { error: err.message });
    }
  }

  return sendJson(405, { error: 'Method Not Allowed' });
}
