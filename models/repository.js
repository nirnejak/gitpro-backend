const mongoose = require('mongoose'); // Install it from Package.json


const repositoriesSchema = mongoose.Schema({
  id: { type: Number },
  node_id: { type: String },
  name: { type: String },
  private: { type: Boolean },
  description: { type: String },
  language: { type: String },
  // TODO: Create a reference to Collaborator Collection
  collaborators: [{ login: String }]
})

module.exports = Repository = mongoose.model('Repository', repositoriesSchema);