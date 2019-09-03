const mongoose = require('mongoose'); // Install it from Package.json

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  login: { type: String, required: true },
  token: { type: String, required: true },
  githubId: { type: String },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
  contributors: [{ login: String }],
  meta: {
    includePublic: { type: Boolean, default: false }
  }
});

module.exports = User = mongoose.model('User', userSchema);