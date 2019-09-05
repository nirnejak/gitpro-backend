const NodeResque = require('node-resque')
const axios = require('axios')
const chalk = require('chalk')

const config = require('../config')

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
      perform: async (saved_user) => {
        axios
          .get("https://api.github.com/user/repos", { headers: { Authorization: `Bearer ${saved_user.token}`, } })
          .then(res => {
            User.findOne({ login: saved_user.login }, (err, user) => {
              if (err) {
                console.log(chalk.red("❗️  User not found!"))
              } else {
                user.repositories = res.data.map(repo => {
                  const { id, node_id, name, private, description, language } = repo;
                  return { id, node_id, name, private, description, language }
                })
                user.save()
                  .then(saved_user => saved_user)
              }
            })
          })
          .catch(err => console.log(chalk.red(err)))
      }
    },
    'fetchCollaborators': {
      perform: (user) => {
        let answer = a - b
        return answer
      }
    },
    'fetchCollaboratorDetails': {
      perform: (user) => {
        let answer = a - b
        return answer
      }
    }
  }

  const worker = new NodeResque.Worker({ connection: connectionDetails, queues: ['fetchRepositories'] })
  await worker.connect()
  worker.start()
}