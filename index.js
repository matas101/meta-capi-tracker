// index.js
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/track', async (req, res) => {
  // Holen der Pixel-ID und des Tokens aus den Umgebungsvariablen
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  const defaultEvent = process.env.EVENT_NAME || 'ClickSpotify';
  const defaultRedirect = process.env.REDIRECT_URL || 'https://open.spotify.com';

  // URL-Parameter (Query) auslesen: eventName und redirect
  const eventName = req.query.eventName || defaultEvent;
  const redirectUrl = req.query.redirect || defaultRedirect;

  const eventTime = Math.floor(Date.now() / 1000);

  // Kundendaten für bessere Zuordnung: IP und User-Agent
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        data: [
          {
            event_name: eventName,
            event_time: eventTime,
            action_source: 'website',
            event_source_url: req.headers.referer || '',
            user_data: {
              client_ip_address: clientIp,
              client_user_agent: userAgent
            }
          }
        ]
      }
    );
  } catch (error) {
    console.error('Meta CAPI Error:', error?.response?.data || error.message);
  }

  // Weiterleiten der Nutzer
  res.redirect(redirectUrl);
});

app.listen(port, () => {
  console.log(`Meta CAPI Tracker running on port ${port}`);
});
