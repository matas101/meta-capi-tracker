// Dieser CAPI-Tracker ermöglicht es, dynamisch über URL-Parameter (Query-Parameter) unterschiedliche Events zu senden und anschließend auf verschiedene Links weiterzuleiten.
// Beispiel-Call im Browser oder Ad-URL:
// https://your-tracker.com/track?eventName=ClickSpotify_clip1_naehe&redirect=https%3A%2F%2Ftoneden.io%2Fmatas%2Fep%3Futm_content%3Dclip1_naehe
// Dabei sind „eventName“ und „redirect“ URL-Parameter (Query-Parameter), die du an den /track-Endpunkt anhängst.

const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/track', async (req, res) => {
  // Holen der Pixel-ID und des Tokens aus den Umgebungsvariablen
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  // Standard-Event-Name und Standard-Redirect, falls keine Parameter übergeben werden
  const defaultEvent = process.env.EVENT_NAME || 'ClickSpotify';
  const defaultRedirect = process.env.REDIRECT_URL || 'https://open.spotify.com';

  // URL-Parameter (Query) auslesen: eventName und redirect
  // req.query.eventName und req.query.redirect sind die Query-Parameter im Link
  const eventName = req.query.eventName || defaultEvent;
  const redirectUrl = req.query.redirect || defaultRedirect;

  const eventTime = Math.floor(Date.now() / 1000);

  try {
    // Senden des Tracking-Events an Meta CAPI
    await axios.post(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        data: [
          {
            event_name: eventName,
            event_time: eventTime,
            action_source: 'website',
            event_source_url: req.headers.referer || '',
            user_data: {}
          }
        ]
      }
    );
  } catch (error) {
    console.error('Meta CAPI Error:', error?.response?.data || error.message);
  }

  // Weiterleiten der Nutzer: redirect-URL aus den Query-Parametern oder Standard
  res.redirect(redirectUrl);
});

app.listen(port, () => {
  console.log(`Meta CAPI Tracker running on port ${port}`);
});

