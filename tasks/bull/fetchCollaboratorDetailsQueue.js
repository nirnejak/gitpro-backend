const Queue = require('bull')
const axios = require('axios')
const chalk = require('chalk')

const config = require('../../config')

const User = require('../../models/user')

const fetchCollaboratorDetailsQueue = new Queue('fetchCollaboratorDetailsQueue', config.queueConfig);

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

module.exports = fetchCollaboratorDetailsQueue