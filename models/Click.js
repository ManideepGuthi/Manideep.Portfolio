const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  element: { type: String }, // e.g., 'contact-button', 'project-link'
  page: { type: String },
  ip: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Click', clickSchema);
