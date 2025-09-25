const express = require('express');
const router = express.Router();

// Admin routes disabled (no DB)
router.get('/login', (req, res) => res.redirect('/'));

// Handle admin login
router.post('/login', (req, res) => res.redirect('/'));

// Admin dashboard (protected)
router.get('/dashboard', async (req, res) => res.redirect('/'));

// Test route
router.get('/test', (req, res) => res.redirect('/'));

// Admin chat page (protected)
router.get('/chat', (req, res) => res.redirect('/'));

// Logout
router.get('/logout', (req, res) => res.redirect('/'));

module.exports = router;
