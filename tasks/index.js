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
            // Filtering User's repositories only, omitting repositories shared with him/her
            let data = res.data.filter(repo => repo.owner.login === user.login)
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
      perform: async (saved_user) => {
        User.findOne({ login: saved_user.login }, (err, user) => {
          if (err) {
            console.log(chalk.red("❗️  User not found!"))
          } else {
            for (let j = 0; j < user.repositories.length; j++) {
              let res_collaborators = await axios.get(`https://api.github.com/repos/${user.login}/${user.repositories[j].name}/collaborators`, { headers: { Authorization: `Bearer ${user.token}`, } })
              if (res_collaborators.data.length > 1) {
                let collaborators = res_collaborators.data.filter(contributor => contributor.login !== user.login)
                collaborators = collaborators.map(contributor => ({
                  login: contributor.login,
                  id: contributor.id,
                  type: contributor.type
                }))
                user.collaborators = [...user.collaborators, ...collaborators]
              }
              
              // Saving instance on the last iteration
              if (user.repositories.length - 1 === j) {
                return await user.save()
              }
            }
          }
        })
      }
    },
    'fetchCollaboratorDetails': {
      perform: async (saved_user) => {
        User.findOne({ login: saved_user.login }, (err, user) => {
          if (err) {
            console.log(chalk.red("❗️  User not found!"))
          } else {
            for (let i = 0; i < user.collaborators.length; i++) {
              let res_collaborators_details = await axios.get(`https://api.github.com/users/${user.collaborators[i].login}`, { headers: { Authorization: `Bearer ${user.token}`, } })
              user.collaborators[i]["name"] = res_collaborators_details.data.name
              user.collaborators[i]["avatar_url"] = res_collaborators_details.data.avatar_url
              
              // Saving instance on the last iteration
              if (i === user.collaborators.length - 1) {
                return await user.save()
              }
            }
            return await user.save()
          }
        })
      }
    }
  }

  const worker = new NodeResque.Worker({ connection: connectionDetails, queues: ['fetchRepositories'] })
  await worker.connect()
  worker.start()
}