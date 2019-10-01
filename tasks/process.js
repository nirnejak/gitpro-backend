const chalk = require('chalk')
const axios = require('axios')
const mongoose = require('mongoose')

const config = require('../config')

const User = require('../models/user')
const Repository = require('../models/repository')
const Collaborator = require('../models/collaborator')

const {
  fetchRepositoriesQueue,
  fetchCollaboratorsQueue,
  fetchCollaboratorDetailsQueue,
  removeCollaboratorFromRepoQueue,
  sendInvitationToCollaborateQueue
} = require('./index')

// INFO: Axios Debug Console
// require('axios-debug-log')({
//   request: (debug, config) => {
//     debug(config)
//   },
//   response: (debug, response) => {
//     debug(
//       'Response with ' + response.headers['Content-Type'],
//       'from ' + response.config.url
//     )
//   },
//   error: (debug, response) => {
//     debug('Boom')
//   }
// })


sendInvitationToCollaborateQueue.process((job, done) => {
  console.log(chalk.yellow("🏃‍  Started Processing sendInvitationToCollaborateQueue"))

  const URL = `https://api.github.com/repos/${job.data.owner}/${job.data.repo}/collaborators/${job.data.username}?permission=push`
  const headers = { Authorization: `Bearer ${job.data.token}` }

  axios.put(URL, {}, { headers })
    .then(res => {
      console.log(chalk.yellow("✅  Completed Processing sendInvitationToCollaborateQueue"))
      done()
    })
    .catch(err => {
      console.log(chalk.red(err))
      done(err)
    })
})

removeCollaboratorFromRepoQueue.process((job, done) => {
  console.log(chalk.yellow("🏃‍  Started Processing removeCollaboratorFromRepoQueue"))

  const URL = `https://api.github.com/repos/${job.data.owner}/${job.data.repo}/collaborators/${job.data.username}`
  const headers = { Authorization: `Bearer ${job.data.token}` }

  axios.delete(URL, { headers })
    .then(res => Collaborator.findOne({ login: job.data.username }).populate('repositories'))
    .then(collaborator => {
      return Repository.findOne({ name: job.data.repo })
        .then(repository => {
          collaborator.repositories = collaborator.repositories.filter(repo => repo.githubId !== repository.githubId)
          return collaborator.save()
        })
        .catch(err => console.log(chalk.red(err)))
    })
    .then(collaborator => {
      if (job.data.last) {
        collaborator.remove()
        console.log(chalk.yellow("✅  Completed Processing removeCollaboratorFromRepoQueue"))
        done()
      } else {
        console.log(chalk.yellow("✅  Completed Processing removeCollaboratorFromRepoQueue"))
        done()
      }
    })
    .catch(err => {
      console.log(chalk.red(err))
      done(err)
    })
})

fetchCollaboratorDetailsQueue.process(async (job, done) => {
  console.log(chalk.yellow("🏃‍  Started Processing fetchCollaboratorDetailsQueue"))

  const headers = { Authorization: `Bearer ${job.data.token}` }
  try {
    let collaborators = await Collaborator.find({ owner: job.data.login })

    if (collaborators.length === 0) {
      console.log(chalk.yellow("✅  Completed Processing fetchCollaboratorDetailsQueue, No Collaborators"))
      done()
    }

    let requestPromises = []
    for (let i = 0; i < collaborators.length; i++) {
      requestPromises.push(axios.get(`https://api.github.com/users/${collaborators[i].login}`, { headers }))
    }

    Promise.all(requestPromises).then(responses => {
      responses.forEach((res, i) => {
        Collaborator.findOne({ githubId: collaborators[i].githubId })
          .then(collaborator => {
            collaborator.name = res.data.name
            collaborator.avatar_url = res.data.avatar_url
            collaborator.email = res.data.email
            return collaborator.save()
          })
      })
      console.log(chalk.yellow("✅  Completed Processing fetchCollaboratorDetailsQueue"))
      done()
    })
  } catch (err) { 
    console.log(chalk.red(err))
    done(err)
  }
})

fetchCollaboratorsQueue.process(async (job, done) => {
  console.log(chalk.yellow("🏃‍  Started Processing fetchCollaboratorsQueue"))
  try {
    let repositories = await Repository.find({ user: job.data.login })
    const headers = { Authorization: `Bearer ${job.data.token}` }
    for (let i = 0; i < repositories.length; i++) {
      // let res = await axios.get(`https://api.github.com/repos/${job.data.login}/${repositories[i].name}/collaborators`, { headers })
      let res = await axios.get(`https://api.github.com/repos/${repositories[i].owner}/${repositories[i].name}/collaborators`, { headers })
      if (res.data.length > 1) {
        // Removing Current user from the list of Collaborators for the Repo
        let collaborators = res.data.filter(collaborator => collaborator.login !== job.data.login)

        collaborators.forEach((collaborator_res) => {
          Collaborator.findOne({ githubId: collaborator_res.id })
            .then(collaborator => {
              if (collaborator) {
                collaborator.owner = job.data.login
                collaborator.login = collaborator_res.login
                collaborator.type = collaborator_res.type
                collaborator.avatar_url = collaborator_res.avatar_url
                // TODO: Update Repositories Reference Array
                if (!collaborator.repositories.includes(repositories[i].id)) {
                  collaborator.repositories.push(repositories[i].id)
                }
                return collaborator.save()
              } else {
                let collaborator = new Collaborator({
                  owner: job.data.login,
                  githubId: collaborator_res.id,
                  login: collaborator_res.login,
                  type: collaborator_res.type,
                  avatar_url: collaborator_res.avatar_url,
                })
                collaborator.repositories.push(repositories[i].id)
                return collaborator.save()
              }
            })
            .then(collaborator => { })
            .catch(err => {
              console.log(chalk.red(err))
              done(err)
            })
        })
      }
      if (i === repositories.length - 1) {
        console.log(chalk.yellow("✅  Completed Processing fetchCollaboratorsQueue, Tasks Processing Asynchronously"))
        fetchCollaboratorDetailsQueue.add(job.data)
        done()
      }
    }

    if (repositories.length === 0) {
      console.log(chalk.yellow("✅  Completed Processing fetchCollaboratorsQueue, No Repositories"))
      fetchCollaboratorDetailsQueue.add(job.data)
      done()
    }
  } catch (err) {
    console.log(chalk.red(err))
    done(err)
  }
})

fetchRepositoriesQueue.process((job, done) => {
  console.log(chalk.yellow("🏃‍  Started Processing fetchRepositoriesQueue"))

  const headers = { Authorization: `Bearer ${job.data.token}` }

  axios.get("https://api.github.com/user/repos?per_page=100", { headers })
    .then(res => {
      // Filtering User's repositories only, omitting repositories shared with him/her
      // let repositories = res.data.filter(repo => repo.owner.login === job.data.login)
      let repositories = res.data
      repositories = repositories.map(repo => {
        const { id, node_id, name, private, description, language, owner } = repo;
        return { githubId: id, node_id, name, private, description, language, owner }
      })
      repositories.forEach((repo, index) => {
        Repository.findOne({ githubId: repo.githubId })
          .then(repository => {
            if (repository) {
              repository.user = job.data.login
              repository.owner = repo.owner.login
              repository.node_id = repo.node_id
              repository.name = repo.name
              repository.private = repo.private
              repository.description = repo.description
              repository.language = repo.language
              return repository.save()
            } else {
              let repository = new Repository({ ...repo, user: job.data.login })
              return repository.save()
            }
          })
          .then(repository => {
            if (index === repositories.length - 1) {
              console.log(chalk.yellow("✅  Completed Processing fetchRepositoriesQueue"))
              fetchCollaboratorsQueue.add(job.data)
              done()
            }
          })
          .catch(err => {
            console.log(chalk.red(err))
            done(err)
          })
      })

      if (repositories.length === 0) {
        console.log(chalk.yellow("✅  Completed Processing fetchRepositoriesQueue, No Repositories"))
        fetchCollaboratorsQueue.add(job.data)
        done()
      }
    })
    .catch(err => {
      console.log(chalk.red.inverse(err))
      done(err)
    })
})

// Call the Worker if file is executed directly
if (require.main === module) {
  console.log(chalk.blue.inverse('----------- Started Processing Queue -----------'))

  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      console.log(chalk.green('🔥  MongoDB Connected...'))
      User.find({ status: 'active' }, (err, users) => {
        if (err) {
          console.log(chalk.red("❗️  Users not found!"))
        } else {
          if (process.argv.length > 2) {
            if (process.argv[2] === 'repository') {
              users.forEach(user => {
                fetchRepositoriesQueue.add({ login: user.login, token: user.token })
              })
            } else if (process.argv[2] === 'collaborator') {
              users.forEach(user => {
                fetchCollaboratorsQueue.add({ login: user.login, token: user.token })
              })
            } else if (process.argv[2] === 'collaborator_details') {
              users.forEach(user => {
                fetchCollaboratorDetailsQueue.add({ login: user.login, token: user.token })
              })
            }
          } else {
            users.forEach(user => {
              fetchRepositoriesQueue.add({ login: user.login, token: user.token }, {
                // repeat: {
                //   every: 3600000,   // Repeat task every hour
                //   limit: 100
                // },
                repeat: { cron: '00 1 * * *' }  // Repeat once every day at 1:00
              })
            })
          }
        }
      })
    })
    .catch(err => {
      console.log(chalk.red(err))
      done(err)
    })
}