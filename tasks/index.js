const Queue = require('bull')
const Redis = require('ioredis')

const config = require('../config')

const redisConfig = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  user: config.REDIS_USER,
  password: config.REDIS_PASSWORD,
  database: 0
}

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
const fetchRepositoriesQueue = new Queue('fetchRepositoriesQueue', config.REDIS_URL);
const fetchCollaboratorsQueue = new Queue('fetchCollaboratorsQueue', config.REDIS_URL);
const fetchCollaboratorDetailsQueue = new Queue('fetchCollaboratorDetailsQueue', config.REDIS_URL);
const removeCollaboratorFromRepoQueue = new Queue('removeCollaboratorFromRepoQueue', config.REDIS_URL);
const sendInvitationToCollaborateQueue = new Queue('sendInvitationToCollaborateQueue', config.REDIS_URL);
module.exports = {
  fetchRepositoriesQueue,
  fetchCollaboratorsQueue,
  fetchCollaboratorDetailsQueue,
  removeCollaboratorFromRepoQueue,
  sendInvitationToCollaborateQueue
}