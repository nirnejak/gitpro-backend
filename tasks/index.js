const NodeResque = require('node-resque')
const axios = require('axios')
const chalk = require('chalk')

const config = require('../config')

const fetchRepositories = require('./fetchRepositories')
const fetchCollaborators = require('./fetchCollaborators')
const fetchCollaboratorDetails = require('./fetchCollaboratorDetails')

async function boot() {
  const connectionDetails = {
    pkg: 'ioredis',
    host: config.REDIS_HOST,
    password: config.REDIS_PASSWORD,
    port: config.REDIS_PORT,
    database: 0
  }

  let jobsToComplete = 0

  const jobs = {
    'fetchRepositories': {
      plugins: ['JobLock'],
      pluginOptions: {
        JobLock: {}
      },
      perform: fetchRepositories
    },
    'fetchCollaborators': {
      perform: fetchCollaborators
    },
    'fetchCollaboratorDetails': {
      perform: fetchCollaboratorDetails
    }
  }

  const worker = new NodeResque.Worker({ connection: connectionDetails, queues: ['fetchRepositories'] })
  await worker.connect()
  worker.start()
}