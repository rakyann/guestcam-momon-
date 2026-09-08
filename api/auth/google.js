import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
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

export default async function handler(req, res) {
  const sendHtml = (statusCode, htmlContent) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(htmlContent);
  };

  const sendRedirect = (url) => {
    if (typeof res.redirect === 'function') {
      return res.redirect(url);
    }
    res.statusCode = 302;
    res.setHeader('Location', url);
    res.end();
  };

  const CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
  const CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');

  // Use the standard authorized redirect URI registered in Google Cloud Console
  const redirectUri = 'https://developers.google.com/oauthplayground';

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive.file']
  });

  return sendRedirect(authUrl);
}
