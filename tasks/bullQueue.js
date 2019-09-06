const Queue = require('bull')
const chalk = require('chalk')
const axios = require('axios')

const config = require('../config')

const queueConfig = {
  redis: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    database: 0
  }
}

const fetchRepositoriesQueue = new Queue('fetchRepositoriesQueue', queueConfig);
const fetchCollaboratorsQueue = new Queue('fetchCollaboratorsQueue', queueConfig);
const fetchCollaboratorDetailsQueue = new Queue('fetchCollaboratorDetailsQueue', queueConfig);


fetchCollaboratorDetailsQueue.process((job, done) => {
  console.log(chalk.blue.inverse("fetchCollaboratorDetailsQueue Processing"))
  // TODO: Fetch and Store Details of Collaborators
  done()
})

fetchCollaboratorsQueue.process((job, done) => {
  console.log(chalk.blue.inverse("fetchCollaboratorsQueue Processing"))
  // TODO: Fetch and Store List of Collaborators
  fetchCollaboratorDetailsQueue.add(job.data)
  done()
})

fetchRepositoriesQueue.process((job, done) => {
  console.log(chalk.yellow.inverse("🏃‍  Started Processing fetchRepositoriesQueue"))
  User.findOne({ login: job.data.login }, async (err, user) => {
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
      saved_user = await user.save()
      console.log(chalk.yellow.inverse("✅  Completed Processing fetchRepositoriesQueue"))
      fetchCollaboratorsQueue.add(job.data)
      done()
    }
  })
})

const user = {
  login: 'nirnejak',
  email: 'jeetnirnejak@gmail.com',
  token: '23kjq234gh543hj54434233m2443j',
  githubId: '34534524351246'
}

// Adding a Queue
fetchRepositoriesQueue.add(user)

module.exports = {
  fetchRepositoriesQueue,
  fetchCollaboratorsQueue,
  fetchCollaboratorDetailsQueue
}