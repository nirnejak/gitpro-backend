const Queue = require('bull')
const axios = require('axios')
const chalk = require('chalk')

const config = require('../../config')

const User = require('../../models/user')

const fetchCollaboratorsQueue = require('./fetchCollaboratorsQueue')

const fetchRepositoriesQueue = new Queue('fetchRepositoriesQueue', config.queueConfig);

fetchRepositoriesQueue.process((job, done) => {
  console.log(chalk.yellow("🏃‍  Started Processing fetchRepositoriesQueue"))
  User.findOne({ login: job.data.login }, async (err, user) => {
    if (err) {
      console.log(chalk.red("❗️  User not found!"))
    } else {
      const res = await axios.get("https://api.github.com/user/repos?per_page=100", { headers: { Authorization: `Bearer ${user.token}`, } })
      // Filtering User's repositories only, omitting repositories shared with him/her
      let data = res.data.filter(repo => repo.owner.login === user.login)
      user.repositories = data.map(repo => {
        const { id, node_id, name, private, description, language } = repo;
        return { id, node_id, name, private, description, language }
      })
      saved_user = await user.save()
      console.log(chalk.yellow("✅  Completed Processing fetchRepositoriesQueue"))
      fetchCollaboratorsQueue.add(job.data)
      done()
    }
  })
})

module.exports = fetchRepositoriesQueue