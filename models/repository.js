const mongoose = require('mongoose');


const repositoriesSchema = mongoose.Schema({
  owner: { type: String },
  githubId: { type: Number },
  node_id: { type: String },
  name: { type: String },
  private: { type: Boolean },
  description: { type: String },
  language: { type: String },

  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() }
})

repositoriesSchema.pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

module.exports = Repository = mongoose.model('Repository', repositoriesSchema);