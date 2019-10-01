const Arena = require('bull-arena')
const express = require('express')

const router = express.Router()

const config = require('../config')

const redisConfig = config.REDIS_URL ? config.REDIS_URL : {
  redis: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    user: config.REDIS_USER,
    password: config.REDIS_PASSWORD,
    database: 0
  }
}

const arena = Arena({
  queues: [
    {
      name: 'fetchRepositoriesQueue',
      hostId: 'fetchRepositoriesQueue',
      redis: redisConfig
    },
    {
      name: 'fetchCollaboratorsQueue',
      hostId: 'fetchCollaboratorsQueue',
      redis: redisConfig
    },
    {
      name: 'fetchCollaboratorDetailsQueue',
      hostId: 'fetchCollaboratorDetailsQueue',
      redis: redisConfig
    },
    {
      name: 'removeCollaboratorFromRepoQueue',
      hostId: 'removeCollaboratorFromRepoQueue',
      redis: redisConfig
    },
    {
      name: 'sendInvitationToCollaborateQueue',
      hostId: 'sendInvitationToCollaborateQueue',
      redis: redisConfig
    }
  ]
})

router.use('/', arena)

module.exports = router