const axios = require('axios')
const chalk = require('chalk')

const User = require('../models/user')

async function fetchRepositories(saved_user) {
  try {
    const user = await User.findOne({ login: saved_user.login })
    let res_repo = await axios.get("https://api.github.com/user/repos?per_page=100", { headers: { Authorization: `Bearer ${user.token}`, } })
    let data = res_repo.data.filter(repo => repo.owner.login === saved_user.login)
    user.repositories = data.map(repo => {
      const { id, node_id, name, private, description, language } = repo;
      return { id, node_id, name, private, description, language }
    })
    saved_user = await user.save()
    for (let j = 0; j < saved_user.repositories.length; j++) {
      let res_collaborators = await axios.get(`https://api.github.com/repos/${user.login}/${saved_user.repositories[j].name}/collaborators`, { headers: { Authorization: `Bearer ${saved_user.token}`, } })
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
        saved_user = await user.save()
        // Fetching Details of the Collaborators
        for (let i = 0; i < saved_user.collaborators.length; i++) {
          let res_collaborators_details = await axios.get(`https://api.github.com/users/${saved_user.collaborators[i].login}`, { headers: { Authorization: `Bearer ${user.token}`, } })
          saved_user.collaborators[i]["name"] = res_collaborators_details.data.name
          saved_user.collaborators[i]["avatar_url"] = res_collaborators_details.data.avatar_url
          if (i === saved_user.collaborators.length - 1) {
            saved_user = await user.save()
            console.log(chalk.green("✅  Data Fetched and Stored"))
          }
        }
      }
    }
  } catch (error) {
    console.log(chalk.red(error))
  }
}

module.exports = fetchRepositories