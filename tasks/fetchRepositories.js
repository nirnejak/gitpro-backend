const axios = require('axios')
const chalk = require('chalk')

const config = require('../config')

const User = require('../models/user')

module.exports = fetchRepositories = (saved_user) => {
  axios
    .get("https://api.github.com/user/repos", { headers: { Authorization: `Bearer ${saved_user.token}`, } })
    .then(res => {
      User.findOne({ login: saved_user.login }, (err, user) => {
        if (err) {
          console.log(chalk.red("❗️  User not found!"))
        } else {
          user.repositories = res.data.map(repo => {
            const { id, node_id, name, private, description, language } = repo;
            return { id, node_id, name, private, description, language }
          })
          user.save()
            .then(saved_user => {
              saved_user.repositories.forEach((repository, index) => {
                // Fetching Collaborators
                axios
                  .get(`https://api.github.com/repos/${saved_user.login}/${repository.name}/collaborators`, { headers: { Authorization: `Bearer ${saved_user.token}`, } })
                  .then(res => {
                    if (res.data.length > 1) {
                      let collaborators = res.data.filter(contributor => contributor.login !== saved_user.login)
                      collaborators = collaborators.map(contributor => ({
                        login: contributor.login,
                        id: contributor.id,
                        type: contributor.type
                      }))
                      user.collaborators = [...user.collaborators, ...collaborators]
                    }
                    // Saving instance on the last iteration
                    if (saved_user.repositories.length - 1 === index) {
                      user.save()
                        .then(saved_user => {
                          // Fetching Details of the Collaborators
                          for (let i = 0; i < user.collaborators.length; i++) {
                            axios.get(`https://api.github.com/users/${user.collaborators[i].login}`, { headers: { Authorization: `Bearer ${saved_user.token}`, } })
                              .then(res => {
                                user.collaborators[i]["name"] = res.data.name
                                user.collaborators[i]["avatar_url"] = res.data.avatar_url
                                if (i === user.collaborators.length - 1) {
                                  user.save()
                                    .then(saved_user => console.log(chalk.green("✅  Data Fetched and Stored")))
                                    .catch(err => console.log(chalk.red(err)))
                                }
                              })
                              .catch(err => console.log(chalk.red(err)))
                          }
                        })
                        .catch(err => console.log(chalk.red.inverse("Error") + chalk.red(err)))
                    }
                  })
                  .catch(err => console.log(chalk.red(err)))
              })
            })
        }
      })
    })
    .catch(err => console.log(chalk.red(err)))
}