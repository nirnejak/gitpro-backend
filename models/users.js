var mongoose = require('mongoose'); // Install it from Package.json

var userSchema = mongoose.Schema({
  name: { type: String, required: true },
  login: { type: String, required: true },
  token: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

module.exports = userModel = mongoose.model('usermodel', userSchema);