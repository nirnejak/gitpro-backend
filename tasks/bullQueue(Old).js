const Queue = require('bull')
const chalk = require('chalk')
const axios = require('axios')
const mongoose = require('mongoose')

const config = require('../config')

const User = require('../models/user')

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
  console.log(chalk.yellow("🏃‍  Started Processing fetchCollaboratorDetailsQueue"))
  User.findOne({ login: saved_user.login }, async (err, user) => {
    if (err) {
      console.log(chalk.red("❗️  User not found!"))
    } else {
      try {
        for (let i = 0; i < user.collaborators.length; i++) {
          let res_collaborators_details = await axios.get(`https://api.github.com/users/${user.collaborators[i].login}`, { headers: { Authorization: `Bearer ${user.token}`, } })
          user.collaborators[i]["name"] = res_collaborators_details.data.name
          user.collaborators[i]["avatar_url"] = res_collaborators_details.data.avatar_url

          // Saving instance on the last iteration
          if (i === user.collaborators.length - 1) {
            console.log(chalk.yellow("✅  Completed worker fetchCollaboratorDetails"))
            return await user.save()
          }
        }

        if (user.collaborators.length === 0) {
          console.log(chalk.yellow("✅  Completed worker fetchCollaboratorDetails, No Collaborators"))
        }
      } catch (err) {
        console.log(chalk.red(err))
      }
    }
  })
  done()
})

fetchCollaboratorsQueue.process((job, done) => {
  console.log(chalk.yellow("🏃‍  Started Processing fetchCollaboratorsQueue"))
  User.findOne({ login: job.data.login }, async (err, user) => {
    if (err) {
      console.log(chalk.red("❗️  User not found!"))
    } else {
      try {
        for (let j = 0; j < user.repositories.length; j++) {
          let res_collaborators = await axios.get(`https://api.github.com/repos/${user.login}/${user.repositories[j].name}/collaborators`, { headers: { Authorization: `Bearer ${user.token}`, } })
          if (res_collaborators.data.length > 1) {
            let collaborators = res_collaborators.data.filter(collaborator => collaborator.login !== user.login)
            collaborators = collaborators.map(collaborator => ({
              login: collaborator.login,
              id: collaborator.id,
              type: collaborator.type
            }))
            let user_collaborators = user.collaborators.map(collaborator => ({
              login: collaborator.login,
              id: collaborator.id,
              type: collaborator.type
            }))
            collaborators = collaborators.filter(collaborator => !user_collaborators.includes(collaborators))
            user.collaborators = [...user_collaborators, ...collaborators]
            // console.log(JSON.stringify(user.collaborators, null, 4))
          }
          // Saving instance on the last iteration
          if (j === user.repositories.length - 1) {
            saved_user = await user.save()
            console.log(chalk.yellow("✅  Completed worker fetchCollaborators"))
            fetchCollaboratorDetailsQueue.add(job.data)
            done(null, saved_user)
          }
        }

        if (user.repositories.length === 0) {
          console.log(chalk.yellow("✅  Completed worker fetchCollaborators, No Repositories"))
          fetchCollaboratorDetailsQueue.add(job.data)
          done()
        }
      } catch (err) {
        console.log(chalk.red(err))
        done(err)
      }
    }
  })

})

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

// Call the Worker if file is executed directly
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log(chalk.green('🔥  MongoDB Connected...'))
    User.find({}, async (err, users) => {
      if (err) {
        console.log(chalk.red("❗️  Users not found!"))
      } else {
        users.forEach(user => fetchRepositoriesQueue.add({ login: user.login }))
      }
    })
  })
  .catch(err => console.log(chalk.red(err)))

module.exports = {
  fetchRepositoriesQueue,
  fetchCollaboratorsQueue,
  fetchCollaboratorDetailsQueue
}