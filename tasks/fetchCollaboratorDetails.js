const axios = require('axios')
const chalk = require('chalk')

module.exports = fetchCollaboratorDetails = async (saved_user) => {
  console.log(chalk.yellow.inverted("🏃‍  Started worker fetchCollaboratorDetails"))
  User.findOne({ login: saved_user.login }, async (err, user) => {
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
      saved_user = await user.save()
      console.log(chalk.yellow.inverted("✅  Completed worker fetchCollaboratorDetails"))
      return saved_user
    }
  })
}