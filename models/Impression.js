const mongoose = require('mongoose');

const impressionSchema = new mongoose.Schema({
  page: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Impression', impressionSchema);
