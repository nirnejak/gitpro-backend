const NodeResque = require('node-resque')
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

  let user = {
    login: 'nirnejak'
  }

  const jobs = {
    'fetchRepositories': {
      plugins: ['JobLock'],
      pluginOptions: { JobLock: {} },
      perform: fetchRepositories(user)
    },
    'fetchCollaborators': { perform: fetchCollaborators(user) },
    'fetchCollaboratorDetails': { perform: fetchCollaboratorDetails(user) }
  }
  const worker = new NodeResque.Worker({ connection: connectionDetails }, jobs)
  await worker.connect()
  worker.start()

  worker.on('start', () => console.log(chalk.yellow("👍  Worker Started")))
  worker.on('end', () => console.log(chalk.yellow("Worker Ended")))
  worker.on('job', (queue, job) => console.log(chalk.yellow(`Working ${job} of ${queue}`)))
  worker.on('error', (queue, job, error) => console.log(chalk.red(`Error in ${job} of ${queue} : ${error}`)))
}

module.exports = boot