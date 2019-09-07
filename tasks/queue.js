const NodeResque = require('node-resque')
const chalk = require('chalk')
const mongoose = require('mongoose')

const config = require('../config')

const fetchRepositories = require('./fetchRepositories')
const fetchCollaborators = require('./fetchCollaborators')
const fetchCollaboratorDetails = require('./fetchCollaboratorDetails')

async function processQueue(user) {
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
      pluginOptions: { JobLock: {} },
      perform: fetchRepositories(user)
    },
    'fetchCollaborators': { perform: fetchCollaborators(user) },
    'fetchCollaboratorDetails': { perform: fetchCollaboratorDetails(user) }
  }
  const queue = new NodeResque.Queue({ connection: connectionDetails }, jobs)

  queue.on('error', (error) => console.log(chalk.red(error)))

  await queue.connect(() => {
    // Can also be called outside, or using await
    console.log("Queue Connected")
    queue.enqueue('fetchRepositoriesQueue', "fetchRepositories", user, (err, data) => {
      console.log(chalk.red(err))
      console.log(chalk.blue(data))
    })
    queue.enqueue('fetchCollaboratorsQueue', "fetchCollaborators", user, (err, data) => {
      console.log(chalk.red(err))
      console.log(chalk.blue(data))
    })
    queue.enqueue('fetchCollaboratorDetailsQueue', "fetchCollaboratorDetails", user, (err, data) => {
      console.log(chalk.red(err))
      console.log(chalk.blue(data))
    })

    const worker = new NodeResque.Worker({ connection: connectionDetails, queues: ['fetchRepositoriesQueue', 'fetchCollaboratorsQueue', 'fetchCollaboratorDetailsQueue'] }, jobs)

    worker.connect(() => {
      worker.workerCleanup()
      worker.start()
    })

    worker.on('error', (queue, job, error) => console.log(chalk.red(error)))
  })
}

// Call the Worker if file is executed directly
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log(chalk.green('🔥  MongoDB Connected...'))
    User.find({}, async (err, users) => {
      if (err) {
        console.log(chalk.red("❗️  Users not found!"))
      } else {
        users.forEach(user => processQueue({ login: user.login }))
      }
    })
  })

module.exports = processQueue