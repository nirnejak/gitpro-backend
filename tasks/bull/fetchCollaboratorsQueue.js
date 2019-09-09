const Queue = require('bull')
const axios = require('axios')
const chalk = require('chalk')

const config = require('../../config')

const User = require('../../models/user')

const fetchCollaboratorDetailsQueue = require('./fetchCollaboratorDetailsQueue')

const fetchCollaboratorsQueue = new Queue('fetchCollaboratorsQueue', config.queueConfig);


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

module.exports = fetchCollaboratorsQueue