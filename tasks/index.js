const Queue = require('bull')
const Redis = require('ioredis')

const config = require('../config')

const redisConfig = config.REDIS_URL

const client = new Redis(redisConfig)
const subscriber = new Redis(redisConfig)
const queueConfig = {
  createClient: (type, config) => {
    switch (type) {
      case 'client': return client
      case 'subscriber': return subscriber
      default: return new Redis(redisConfig)
    }
  }
}
const fetchRepositoriesQueue = new Queue('fetchRepositoriesQueue', queueConfig);
const fetchCollaboratorsQueue = new Queue('fetchCollaboratorsQueue', queueConfig);
const fetchCollaboratorDetailsQueue = new Queue('fetchCollaboratorDetailsQueue', queueConfig);
const removeCollaboratorFromRepoQueue = new Queue('removeCollaboratorFromRepoQueue', queueConfig);
const sendInvitationToCollaborateQueue = new Queue('sendInvitationToCollaborateQueue', queueConfig);
module.exports = {
  fetchRepositoriesQueue,
  fetchCollaboratorsQueue,
  fetchCollaboratorDetailsQueue,
  removeCollaboratorFromRepoQueue,
  sendInvitationToCollaborateQueue
}