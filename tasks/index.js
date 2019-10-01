const Queue = require('bull')

const config = require('../config')

const queueConfig = config.REDIS_URL ? config.REDIS_URL : {
  redis: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    database: 0
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