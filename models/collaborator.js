const mongoose = require('mongoose');

const collaboratorsSchema = mongoose.Schema({
  owner: { type: String },
  githubId: { type: Number },
  login: { type: String },
  type: { type: String },
  name: { type: String },
  avatar_url: { type: String },
  email: { type: String },
  repositories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }]
})

module.exports = Collaborator = mongoose.model('Collaborator', collaboratorsSchema);