const mongoose = require('mongoose');

const collaboratorsSchema = mongoose.Schema({
  owner: { type: String },
  githubId: { type: Number },
  login: { type: String },
  type: { type: String },
  name: { type: String },
  avatar_url: { type: String },
  email: { type: String },
  repositories: [{ name: String }]
})

module.exports = Collaborator = mongoose.model('Collaborator', collaboratorsSchema);