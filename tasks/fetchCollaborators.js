const axios = require('axios')
const chalk = require('chalk')

const User = require('../models/user')
const Collaborator = require('../models/collaborator')

module.exports = fetchCollaborators = async (saved_user) => {
  console.log(chalk.yellow("🏃‍  Started worker fetchCollaborators"))
  User.findOne({ login: saved_user.login }, async (err, user) => {
    if (err) {
      console.log(chalk.red("❗️  User not found!"))
    } else {
      try {
        for (let j = 0; j < user.repositories.length; j++) {
          let res_collaborators = await axios.get(`https://api.github.com/repos/${user.login}/${user.repositories[j].name}/collaborators`, { headers: { Authorization: `Bearer ${user.token}`, } })
          if (res_collaborators.data.length > 1) {
            let collaborators = res_collaborators.data.filter(contributor => contributor.login !== user.login)
            collaborators = collaborators.map(contributor => ({
              login: contributor.login,
              id: contributor.id,
              type: contributor.type
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
            return saved_user
          }
        }

        if (user.repositories.length === 0) {
          console.log(chalk.yellow("✅  Completed worker fetchCollaborators, No Repositories"))
        }
      } catch (err) {
        console.log(chalk.red(err))
      }
    }
  })
}