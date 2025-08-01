// index.js
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/track', async (req, res) => {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  const defaultEvent = process.env.EVENT_NAME || 'ClickSpotify';
  const defaultRedirect = process.env.REDIRECT_URL || 'https://open.spotify.com';

  const eventName = req.query.event_name || defaultEvent;
  const redirectUrl = req.query.redirect_url || defaultRedirect;
  const testEventCode = req.query.test_event_code; // 🆕 Neu: Testcode auslesen

    // Zusätzliche Tracking-Parameter (optional)
  const utmSource = req.query.utm_source || '';
  const utmMedium = req.query.utm_medium || '';
  const utmCampaign = req.query.utm_campaign || '';
  const utmContent = req.query.utm_content || '';

  const adName = req.query.ad_name || '';
  const adSet = req.query.ad_set || '';
  const campaignName = req.query.campaign || '';
  const contentType = req.query.content_type || '';
  const version = req.query.version || '';

  const eventTime = Math.floor(Date.now() / 1000);
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  console.log(`Track request: event=${eventName}, redirect=${redirectUrl}`);

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        action_source: 'website',
        event_source_url: req.headers.referer || '',
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: userAgent
        },
        custom_data: {
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
          ad_name: adName,
          ad_set: adSet,
          campaign: campaignName,
          content_type: contentType,
          version: version
        }
      }
    ]
  };

  console.log('Sending event to Meta CAPI with payload:', JSON.stringify(payload, null, 2));


  // 🆕 Testcode anhängen, falls vorhanden
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      payload
    );
  } catch (error) {
    console.error('Meta CAPI Error:', error?.response?.data || error.message);
  }

  res.redirect(redirectUrl);
});

app.listen(port, () => {
  console.log(`Meta CAPI Tracker running on port ${port}`);
});

