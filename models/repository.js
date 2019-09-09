const mongoose = require('mongoose'); // Install it from Package.json


const repositoriesSchema = mongoose.Schema({
  owner: { type: String },
  githubId: { type: Number },
  node_id: { type: String },
  name: { type: String },
  private: { type: Boolean },
  description: { type: String },
  language: { type: String },
  collaborators: [{ login: String }]
})

module.exports = Repository = mongoose.model('Repository', repositoriesSchema);