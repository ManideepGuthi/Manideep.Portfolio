const express = require('express');
const router = express.Router();
// DB models removed
const nodemailer = require('nodemailer');
const axios = require('axios');

// Google Forms defaults (used if .env not provided)
const GFORM_ID = process.env.GFORM_ID || '1FAIpQLSdFMm_bvyUtn9p6RvD5gY8CkH_awK0qaqm0H4ZGRMcGM6ux0Q';
const GFORM_ENTRY_NAME = process.env.GFORM_ENTRY_NAME || 'entry.2005620554';
const GFORM_ENTRY_EMAIL = process.env.GFORM_ENTRY_EMAIL || 'entry.1045781291';
const GFORM_ENTRY_MESSAGE = process.env.GFORM_ENTRY_MESSAGE || 'entry.1065046570';
const GSCRIPT_WEBAPP_URL = process.env.GSCRIPT_WEBAPP_URL || '';

// Mail transporter (uses env config)
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

// Middleware to track impressions
// Impression tracking removed

// Home page
router.get('/', (req, res) => {
  res.render('index', {
    name: 'Guthi Manideep',
    skills: {
      frontend: 'Building responsive and interactive user interfaces with modern web technologies',
      backend: 'Developing robust server-side applications and APIs with modern frameworks',
      database: 'Designing and managing efficient data storage solutions for scalable applications',
      languages: 'Proficient in multiple programming languages for diverse development needs',
      fullstack: 'End-to-end development expertise combining frontend and backend technologies',
      other: 'Additional tools and software for development, design, and content creation'
    },
    contact: 'manideep@gmail.com',
    submitted: req.query.submitted === 'true'
  });
});

// Chat route disabled per requirement
// router.get('/chat', (req, res) => {
//   res.render('chat', {
//     name: 'Guthi Manideep'
//   });
// });

// Handle contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    console.log('Incoming contact payload:', { name, email, message });

    // Basic server-side validation
    if (!name || !email || !message) {
      const error = 'Missing required fields';
      console.warn('Contact validation failed:', error, req.body);
      const acceptsJson = req.xhr || (req.headers['accept'] || '').includes('application/json');
      return acceptsJson
        ? res.status(400).json({ ok: false, error })
        : res.redirect('/?submitted=false');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = 'Invalid email';
      console.warn('Contact validation failed:', error, email);
      const acceptsJson = req.xhr || (req.headers['accept'] || '').includes('application/json');
      return acceptsJson
        ? res.status(400).json({ ok: false, error })
        : res.redirect('/?submitted=false');
    }

    // No DB: log only
    console.log('Contact received (no DB):', { name, email, message });

    // Send email notification (best-effort, won't block response)
    const adminEmail = process.env.MAIL_TO || process.env.SMTP_USER;
    if (adminEmail && process.env.SMTP_HOST) {
      try {
        const mailOptions = {
          from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com',
          to: adminEmail,
          subject: `New contact message from ${name}`,
          text: `You received a new message on your portfolio\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nMessage ID: ${String(saved._id)}`,
          html: `<p>You received a new message on your portfolio.</p>
                 <p><strong>Name:</strong> ${name}<br/>
                 <strong>Email:</strong> ${email}</p>
                 <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
                 <p><small>Time: ${new Date().toISOString()}</small></p>`
        };
        await mailTransporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error('Contact email send failed:', mailErr);
      }
    }

    // Forward to Google Forms (best-effort)
    if (GFORM_ID && GFORM_ENTRY_NAME && GFORM_ENTRY_EMAIL && GFORM_ENTRY_MESSAGE) {
      try {
        const formView = `https://docs.google.com/forms/d/e/${GFORM_ID}/viewform`;
        const formAction = `https://docs.google.com/forms/d/e/${GFORM_ID}/formResponse`;

        // Step 1: Fetch the form to get fbzx token and cookies
        const getResp = await axios.get(formView, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
          },
          validateStatus: () => true
        });
        const html = (getResp && getResp.data) || '';
        const fbzxMatch = html.match(/name="fbzx"\s+value="([^"]+)"/);
        const fbzx = fbzxMatch ? fbzxMatch[1] : '';
        const setCookies = getResp.headers && getResp.headers['set-cookie'];
        const cookieHeader = Array.isArray(setCookies) ? setCookies.map(c => c.split(';')[0]).join('; ') : undefined;

        const payload = new URLSearchParams();
        const nameStr = typeof name === 'string' ? name : String(name ?? '');
        const emailStr = typeof email === 'string' ? email : String(email ?? '');
        const messageStr = typeof message === 'string' ? message : String(message ?? '');
        payload.append(GFORM_ENTRY_NAME, nameStr.trim());
        payload.append(GFORM_ENTRY_EMAIL, emailStr.trim());
        payload.append(GFORM_ENTRY_MESSAGE, messageStr);
        // Common hidden fields used by Google Forms to accept submissions
        payload.append('fvv', '1');
        payload.append('pageHistory', '0');
        payload.append('submit', 'Submit');
        if (fbzx) {
          payload.append('fbzx', fbzx);
        }

        const baseHeaders = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://docs.google.com',
          'Referer': formView,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...(cookieHeader ? { Cookie: cookieHeader } : {})
        };

        let gfResp = await axios.post(formAction, payload.toString(), {
          headers: baseHeaders,
          maxRedirects: 5,
          validateStatus: () => true,
          withCredentials: true
        });
        console.log('Google Forms post status (primary):', gfResp && gfResp.status);

        // Treat 200/302/303 as success (Google often redirects after submit)
        if (gfResp && [200, 302, 303].includes(gfResp.status)) {
          console.log('Google Forms submission considered successful (primary).');
        } else if (gfResp && gfResp.status === 401) {
          // Fallback 1: GET with query string
          const qs = payload.toString();
          const getSubmitUrl = `${formAction}?${qs}`;
          const gfRespGet = await axios.get(getSubmitUrl, {
            headers: {
              ...baseHeaders,
              'Content-Type': undefined
            },
            maxRedirects: 5,
            validateStatus: () => true,
            withCredentials: true
          });
          console.log('Google Forms post status (fallback GET):', gfRespGet && gfRespGet.status);
          if (gfRespGet && [200, 302, 303].includes(gfRespGet.status)) {
            console.log('Google Forms submission considered successful (fallback GET).');
          } else {
            gfResp = gfRespGet;
          }
        }

        if (gfResp && gfResp.status === 401) {
          // Fallback 2: POST to embedded endpoint
          const embeddedUrl = `${formAction}?embedded=true`;
          const gfRespEmbedded = await axios.post(embeddedUrl, payload.toString(), {
            headers: baseHeaders,
            maxRedirects: 5,
            validateStatus: () => true,
            withCredentials: true
          });
          console.log('Google Forms post status (fallback embedded):', gfRespEmbedded && gfRespEmbedded.status);
          if (gfRespEmbedded && [200, 302, 303].includes(gfRespEmbedded.status)) {
            console.log('Google Forms submission considered successful (fallback embedded).');
          } else {
            gfResp = gfRespEmbedded;
          }
        }
      } catch (gfErr) {
        const status = gfErr && gfErr.response && gfErr.response.status;
        console.error('Google Forms forward failed:', status || gfErr.message);
        if (status === 401) {
          console.error('Tip: Ensure the form does not require sign-in (Settings → Responses → uncheck "Restrict to users").');
        }
      }
    }

    // Alternative: Forward to Google Apps Script Web App (recommended)
    if (GSCRIPT_WEBAPP_URL) {
      try {
        const gsResp = await axios.post(GSCRIPT_WEBAPP_URL, { name, email, message }, {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true
        });
        console.log('Apps Script post status:', gsResp && gsResp.status);
      } catch (gsErr) {
        console.error('Apps Script forward failed:', gsErr?.response?.status || gsErr.message);
      }
    }

    const acceptsJson = req.xhr || (req.headers['accept'] || '').includes('application/json');
    if (acceptsJson) {
      return res.status(201).json({ ok: true });
    }
    return res.redirect('/?submitted=true');
  } catch (err) {
    console.error('Contact save failed:', err);
    const acceptsJson = req.xhr || (req.headers['accept'] || '').includes('application/json');
    if (acceptsJson) {
      return res.status(500).json({ ok: false, error: 'Server error' });
    }
    return res.redirect('/?submitted=false');
  }
});

// Track clicks (e.g., from JS)
router.post('/track-click', async (req, res) => {
  const { element, page } = req.body;
  const click = new Click({ element, page, ip: req.ip });
  await click.save();
  res.sendStatus(200);
});

module.exports = router;
