const Queue = require('bull')
const chalk = require('chalk')
const axios = require('axios')
const mongoose = require('mongoose')

const config = require('../config')

const User = require('../models/user')
const Repository = require('../models/repository')
const Collaborator = require('../models/collaborator')

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
  Repository.find({ owner: job.data.login }, async (err, repositories) => {
    if (err) {
      console.log(chalk.red("❗️  User not found!"))
    } else {
      try {
        for (let i = 0; i < repositories.length; i++) {
          let res = await axios.get(`https://api.github.com/repos/${job.data.login}/${repositories[i].name}/collaborators`, { headers: { Authorization: `Bearer ${job.data.token}`, } })
          if (res.data.length > 1) {
            // Removing Current user from the list of Collaborators for the Repo
            let collaborators = res.data.filter(collaborator => collaborator.login !== job.data.login)

            // TODO: Create or Update the Collaborator
            collaborators.forEach((collaborator_res) => {
              Collaborator.findOne({ githubId: collaborator_res.id }, (err, collaborator) => {
                if (err) {
                  console.log(chalk.red(err))
                } else {
                  if (collaborator) {
                    // TODO: Update only if collaborator is older than 5 hours
                    collaborator.owner = job.data.login
                    collaborator.login = collaborator_res.login
                    collaborator.type = collaborator_res.type
                    collaborator.name = collaborator_res.name
                    collaborator.avatar_url = collaborator_res.avatar_url
                    collaborator.email = collaborator_res.email
                    // TODO: Update Repositories
                    collaborator.save()
                      .then(collaborator => { })
                      .catch(err => console.log(chalk.red(err)))
                  } else {
                    let collaborator = new Collaborator({
                      owner: job.data.login,
                      githubId: collaborator_res.id,
                      login: collaborator_res.login,
                      type: collaborator_res.type,
                      name: collaborator_res.name,
                      avatar_url: collaborator_res.avatar_url,
                      email: collaborator_res.email,
                    })
                    // TODO: Add Current Repository
                    collaborator.save()
                      .then(collaborator => { })
                      .catch(err => console.log(chalk.red(err)))
                  }
                }
              })
            })
          }
          if (i === repositories.length - 1) {
            console.log(chalk.yellow("✅  Completed worker fetchCollaborators, Tasks Processing Asynchronously"))
            fetchCollaboratorDetailsQueue.add(job.data)
            done()
          }
        }

        if (repositories.length === 0) {
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
  axios.get("https://api.github.com/user/repos?per_page=100", { headers: { Authorization: `Bearer ${job.data.token}`, } })
    .then(res => {
      // Filtering User's repositories only, omitting repositories shared with him/her
      let repositories = res.data.filter(repo => repo.owner.login === job.data.login)
      repositories = repositories.map(repo => {
        const { id, node_id, name, private, description, language } = repo;
        return { githubId: id, node_id, name, private, description, language }
      })
      repositories.forEach((repo, index) => {
        Repository.findOne({ githubId: repo.githubId }, (err, repository) => {
          if (err) {
            console.log(chalk.red(err))
          } else {
            if (repository) {
              // TODO: Update only if repository is older than 5 hours
              repository.owner = job.data.login
              repository.node_id = repo.node_id
              repository.name = repo.name
              repository.private = repo.private
              repository.description = repo.description
              repository.language = repo.language
              repository.save()
                .then(repository => {
                  if (index === repositories.length - 1) {
                    console.log(chalk.yellow("✅  Completed Processing fetchRepositoriesQueue"))
                    fetchCollaboratorsQueue.add(job.data)
                    done()
                  }
                })
                .catch(err => console.log(chalk.red(err)))
            } else {
              let repository = new Repository({ ...repo, owner: job.data.login })
              repository.save()
                .then(repository => {
                  if (index === repositories.length - 1) {
                    console.log(chalk.yellow("✅  Completed Processing fetchRepositoriesQueue"))
                    fetchCollaboratorsQueue.add(job.data)
                    done()
                  }
                })
                .catch(err => console.log(chalk.red(err)))
            }
          }
        })
      })

      if (repositories.length === 0) {
        console.log(chalk.yellow("✅  Completed Processing fetchRepositoriesQueue, No Repositories"))
        fetchCollaboratorsQueue.add(job.data)
        done()
      }
    })
    .catch(err => console.log(chalk.red.inverse(err)))
})

// Call the Worker if file is executed directly
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log(chalk.green('🔥  MongoDB Connected...'))
    User.find({}, (err, users) => {
      if (err) {
        console.log(chalk.red("❗️  Users not found!"))
      } else {
        users.forEach(user => {
          fetchRepositoriesQueue.add({ login: user.login, token: user.token })
        })
      }
    })
  })
  .catch(err => console.log(chalk.red(err)))

module.exports = {
  fetchRepositoriesQueue,
  fetchCollaboratorsQueue,
  fetchCollaboratorDetailsQueue
}