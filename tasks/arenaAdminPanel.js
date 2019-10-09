const Arena = require('bull-arena')
const express = require('express')

const router = express.Router()

const config = require('../config')

const arena = Arena({
  queues: [
    {
      name: 'fetchRepositoriesQueue',
      hostId: 'fetchRepositoriesQueue',
      redis: config.REDIS_URL
    },
    {
      name: 'fetchCollaboratorsQueue',
      hostId: 'fetchCollaboratorsQueue',
      redis: config.REDIS_URL
    },
    {
      name: 'fetchCollaboratorDetailsQueue',
      hostId: 'fetchCollaboratorDetailsQueue',
      redis: config.REDIS_URL
    },
    {
      name: 'removeCollaboratorFromRepoQueue',
      hostId: 'removeCollaboratorFromRepoQueue',
      redis: config.REDIS_URL
    },
    {
      name: 'sendInvitationToCollaborateQueue',
      hostId: 'sendInvitationToCollaborateQueue',
      redis: config.REDIS_URL
    }
  ]
})

router.use('/', arena)

module.exports = router