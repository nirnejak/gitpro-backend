const mongoose = require('mongoose'); // Install it from Package.json

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  login: { type: String, required: true },
  token: { type: String, required: true },
  githubId: { type: String },
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
  contributors: [{ login: String }],
  avatar_url: { type: String },
  meta: {
    includePublic: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
  },
  repositories: [
    {
      name: { type: String },
      id: { type: String },
      contributors: [{ login: String }]
    }
  ]
});

userSchema.pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

module.exports = User = mongoose.model('User', userSchema);