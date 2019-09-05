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
        User.findOne({ login: saved_user.login }, (err, user) => {
          if (err) {
            console.log(chalk.red("❗️  User not found!"))
          } else {
            const res = await axios.get("https://api.github.com/user/repos", { headers: { Authorization: `Bearer ${user.token}`, } })
            let data = res.data.filter(repo => repo.owner.login === saved_user.login)
            user.repositories = data.map(repo => {
              const { id, node_id, name, private, description, language } = repo;
              return { id, node_id, name, private, description, language }
            })
            return await user.save()
          }
        })
      }
    },
    'fetchCollaborators': {
      perform: (user) => {
        return user
      }
    },
    'fetchCollaboratorDetails': {
      perform: (user) => {
        return user
      }
    }
  }

  const worker = new NodeResque.Worker({ connection: connectionDetails, queues: ['fetchRepositories'] })
  await worker.connect()
  worker.start()
}