const mongoose = require('mongoose'); // Install it from Package.json

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  login: { type: String, required: true },
  token: { type: String, required: true },
  githubId: { type: String },
  avatar_url: { type: String },
  email: { type: String },

  includePublic: { type: Boolean, default: true },
  status: { type: String, default: 'active' },
  isAdmin: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

userSchema.pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

module.exports = User = mongoose.model('User', userSchema);