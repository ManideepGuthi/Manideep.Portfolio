const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Impression = require('../models/Impression');
const Click = require('../models/Click');

// Admin login page
router.get('/login', (req, res) => {
  res.render('admin-login');
});

// Handle admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.admin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin-login', { error: 'Invalid credentials' });
  }
});

// Admin dashboard (protected)
router.get('/dashboard', async (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  const contacts = await Contact.find().sort({ date: -1 });
  const impressions = await Impression.countDocuments();
  const clicks = await Click.countDocuments();
  res.render('admin-dashboard', { contacts, impressions, clicks });
});

// Test route
router.get('/test', (req, res) => {
  res.send('Admin routes are working!');
});

// Admin chat page (protected)
router.get('/chat', (req, res) => {
  // Temporarily disabled authentication for testing
  // if (!req.session.admin) {
  //   return res.redirect('/admin/login');
  // }
  res.render('admin-chat', {
    name: 'Guthi Manideep'
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router;
