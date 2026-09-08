import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

  if (req.method !== 'POST') {
    return sendJson(405, { error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 25 * 1024 * 1024
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const eventId = Array.isArray(fields.eventId) ? fields.eventId[0] : (fields.eventId || 'alfiano-monita');
    const guestSessionId = Array.isArray(fields.guestSessionId) ? fields.guestSessionId[0] : (fields.guestSessionId || 'Tamu Acara');
    const caption = Array.isArray(fields.caption) ? fields.caption[0] : (fields.caption || '');

    if (!file) {
      return sendJson(400, { error: 'No file uploaded under form field "file".' });
    }

    let publicUrl = null;
    let driveFileId = null;

    const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwcgVqgr3UnQqLvvjmcaD2whgAlo-EyTqkJK_TCNoBW2n4_CKLpv25g7ixEjtsaCoX/exec';
    let SCRIPT_URL = getEnv('GOOGLE_SCRIPT_URL') || getEnv('GOOGLE_DRIVE_WEBHOOK_URL') || DEFAULT_SCRIPT_URL;
    if (!SCRIPT_URL || SCRIPT_URL.includes('AKfycbwD0pl-WvHefZEeD1CJGStIllcNBazdvvvyLwLwmvMwBEFR5MIp5GjBfkTDJJI2np6ozw') || SCRIPT_URL.includes('AKfycybWDJFwKWrAMRIyQgk')) {
      SCRIPT_URL = DEFAULT_SCRIPT_URL;
    }
    const CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
    const CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
    const REFRESH_TOKEN = getEnv('GOOGLE_REFRESH_TOKEN');
    const FOLDER_ID = getEnv('GOOGLE_DRIVE_FOLDER_ID') || '14ODs7q1sMDOyqybW8J5Mk7qLhw6u29uJ';

    // Method 1: Google Apps Script Webhook (Zero OAuth configuration needed!)
    if (SCRIPT_URL) {
      try {
        const fileBuffer = fs.readFileSync(file.filepath);
        const base64Data = fileBuffer.toString('base64');
        const filename = `tuaipandang_${eventId}_${Date.now()}_${file.originalFilename || 'photo.jpg'}`;
        const mimeType = file.mimetype || 'image/jpeg';

        const webhookRes = await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: base64Data,
            mimeType: mimeType,
            filename: filename,
            folderId: FOLDER_ID,
            guestName: guestSessionId,
            caption: caption
          })
        });

        if (webhookRes.ok) {
          const webhookData = await webhookRes.json();
          if (webhookData.url || webhookData.driveFileId) {
            publicUrl = webhookData.url || `https://lh3.googleusercontent.com/d/${webhookData.driveFileId}`;
            driveFileId = webhookData.driveFileId;
          }
        }
      } catch (scriptErr) {
        console.warn("Google Apps Script Webhook upload warning:", scriptErr.message);
      }
    }

    // Method 2: Google OAuth2 Drive API
    if (!publicUrl && CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN && FOLDER_ID) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          CLIENT_ID,
          CLIENT_SECRET,
          'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const fileStream = fs.createReadStream(file.filepath);
        const fileName = `tuaipandang_${eventId}_${Date.now()}_${file.originalFilename || 'photo.jpg'}`;

        const driveResponse = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: [FOLDER_ID],
            description: `Uploaded by ${guestSessionId}. Caption: ${caption}`
          },
          media: {
            mimeType: file.mimetype || 'image/jpeg',
            body: fileStream
          },
          fields: 'id, webViewLink, webContentLink'
        });

        driveFileId = driveResponse.data.id;

        try {
          await drive.permissions.create({
            fileId: driveFileId,
            requestBody: { role: 'reader', type: 'anyone' }
          });
        } catch (e) {}

        publicUrl = `https://lh3.googleusercontent.com/d/${driveFileId}`;
      } catch (driveErr) {
        console.error("Google Drive API Upload Error:", driveErr.message);
      }
    }

    if (!global._tuaipandangPhotos[eventId]) {
      global._tuaipandangPhotos[eventId] = [];
    }

    const fileBufferForFallback = fs.readFileSync(file.filepath);
    const dataUrlFallback = `data:${file.mimetype || 'image/jpeg'};base64,${fileBufferForFallback.toString('base64')}`;

    const newPhotoRecord = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId: eventId,
      guestName: guestSessionId,
      wish: caption,
      imageUrl: publicUrl || dataUrlFallback,
      driveFileId: driveFileId,
      presetId: 'portra400',
      likes: 0,
      timestamp: new Date().toISOString()
    };

    global._tuaipandangPhotos[eventId].unshift(newPhotoRecord);

    return sendJson(200, {
      success: true,
      driveFileId: driveFileId,
      url: publicUrl,
      photo: newPhotoRecord,
      message: driveFileId ? 'Foto berhasil diunggah ke Google Drive!' : 'Foto tersimpan secara lokal.'
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return sendJson(500, {
      error: 'Failed to upload photo.',
      details: error.message
    });
  }
}
