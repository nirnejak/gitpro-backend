const mongoose = require('mongoose');


const activitySchema = mongoose.Schema({
  owner: { type: String },
  repository: { type: String },
  author: { type: String },
  after: { type: String },
  before: { type: String },
  diffs: [{ type: String }],

  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() }
})

activitySchema.pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

module.exports = Activity = mongoose.model('Activity', activitySchema);