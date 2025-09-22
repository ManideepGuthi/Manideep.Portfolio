const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Impression = require('../models/Impression');
const Click = require('../models/Click');

// Middleware to track impressions
router.use(async (req, res, next) => {
  try {
    const impression = new Impression({
      page: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    await impression.save();
    next();
  } catch (err) {
    console.error('Impression tracking failed:', err);
    next(err); // Pass error to next middleware
  }
});

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
    const { name, email, message } = req.body;
    const contact = new Contact({ name, email, message });
    await contact.save();

    const acceptsJson = req.xhr || (req.headers['accept'] || '').includes('application/json');
    if (acceptsJson) {
      return res.json({ ok: true });
    }
    return res.redirect('/?submitted=true');
  } catch (err) {
    console.error('Contact save failed:', err);
    const acceptsJson = req.xhr || (req.headers['accept'] || '').includes('application/json');
    if (acceptsJson) {
      return res.status(500).json({ ok: false });
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
