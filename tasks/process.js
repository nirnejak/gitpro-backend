const chalk = require('chalk')
const axios = require('axios')
const mongoose = require('mongoose')
const Sentry = require('@sentry/node')

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

Sentry.init({ dsn: config.SENTRY_DSN })

sendInvitationToCollaborateQueue.process((job, done) => {
  console.log(chalk.yellow(`🏃‍  Started Processing sendInvitationToCollaborateQueue for ${job.data.login}`))

  const URL = `https://api.github.com/repos/${job.data.owner}/${job.data.repo}/collaborators/${job.data.username}?permission=push`
  const headers = { Authorization: `Bearer ${job.data.token}` }

  axios.put(URL, {}, { headers })
    .then(res => {
      console.log(chalk.yellow(`✅  Completed Processing sendInvitationToCollaborateQueue for ${job.data.login}`))
      done()
    })
    .catch(err => {
      console.log(chalk.red(err))
      if (err.response) {
        if (err.response.status === 403) {
          done()
        }
      } else {
        done(err)
      }
    })
})

removeCollaboratorFromRepoQueue.process((job, done) => {
  console.log(chalk.yellow(`🏃‍  Started Processing removeCollaboratorFromRepoQueue for ${job.data.username} from ${job.data.owner}/${job.data.repo}`))

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
        console.log(chalk.yellow(`✅  Completed Processing removeCollaboratorFromRepoQueue for ${job.data.username} from ${job.data.owner}/${job.data.repo}`))
        done()
      } else {
        console.log(chalk.yellow(`✅  Completed Processing removeCollaboratorFromRepoQueue for ${job.data.username} from ${job.data.owner}/${job.data.repo}`))
        done()
      }
    })
    .catch(err => {
      console.log(chalk.red(err))
      if (err.response) {
        if (err.response.status === 403) {
          done()
        }
      } else {
        done(err)
      }
    })
})

fetchCollaboratorDetailsQueue.process(async (job, done) => {
  console.log(chalk.yellow(`🏃‍  Started Processing fetchCollaboratorDetailsQueue for ${job.data.login}`))

  const headers = { Authorization: `Bearer ${job.data.token}` }
  try {
    let collaborators = await Collaborator.find({ owner: job.data.login })

    if (collaborators.length === 0) {
      console.log(chalk.yellow(`✅  Completed Processing fetchCollaboratorDetailsQueue, No Collaborators for ${job.data.login}`))
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
      console.log(chalk.yellow(`✅  Completed Processing fetchCollaboratorDetailsQueue for ${job.data.login}`))
      done()
    })
  } catch (err) {
    console.log(chalk.red(err))
    if (err.response) {
      if (err.response.status === 403) {
        done()
      }
    } else {
      done(err)
    }
  }
})

fetchCollaboratorsQueue.process(async (job, done) => {
  console.log(chalk.yellow(`🏃‍  Started Processing fetchCollaboratorsQueue for ${job.data.login}`))

  const headers = { Authorization: `Bearer ${job.data.token}` }

  try {
    const deletedCollaborators = await Collaborator.deleteMany({ owner: job.data.login })

    let repositories = await Repository.find({ user: job.data.login })
    if (repositories.length === 0) {
      console.log(chalk.yellow(`✅  Completed Processing fetchCollaboratorsQueue, No Repositories for ${job.data.login}`))
      fetchCollaboratorDetailsQueue.add(job.data)
      done()
    }

    let fetchCollaboratorsPromise = []
    repositories.forEach(repo => {
      fetchCollaboratorsPromise.push(
        new Promise((resolve, reject) => {
          axios.get(`https://api.github.com/repos/${repo.owner}/${repo.name}/collaborators`, { headers })
            .then(res => {
              resolve(res)
            })
            .catch(err => {
              console.log(chalk.red(err))
              resolve({ data: [] })
            })
        })
      )
    })
    let collaborators_responses = await Promise.all(fetchCollaboratorsPromise)
    collaborators_responses = collaborators_responses.map(res => res.data)

    // Listing Unique Collaborators from all Repositories
    let collaborators = []
    collaborators_responses.forEach(collaborators_res => {
      collaborators_res = collaborators_res.filter(collaborator => collaborator.login !== job.data.login)
      collaborators_res.forEach(collaborator => {
        if (collaborators.filter(collab => collab.login === collaborator.login).length === 0)
          collaborators.push(collaborator)
      })
    })

    // Creating Collaborators
    let collaboratorSavePromise = []
    collaborators.forEach(collaborator_res => {
      let collaborator = new Collaborator({
        owner: job.data.login,
        githubId: collaborator_res.id,
        login: collaborator_res.login,
        type: collaborator_res.type,
        avatar_url: collaborator_res.avatar_url,
      })
      collaboratorSavePromise.push(collaborator.save())
    })
    const saved_collaborators = await Promise.all(collaboratorSavePromise)

    // Assigning Repositories to Collaborators
    let updateCollaboratorSavePromise = []
    saved_collaborators.forEach(collaborator => {
      for (let i = 0; i < repositories.length; i++) {
        if (collaborators_responses[i].filter(collab => collab.login === collaborator.login).length > 0) {
          collaborator.repositories.push(repositories[i].id)
        }
      }
      updateCollaboratorSavePromise.push(collaborator.save())
    })
    const updated_collaborators = await Promise.all(updateCollaboratorSavePromise)
    console.log(chalk.yellow("✅  Completed Processing fetchCollaboratorsQueue"))
    fetchCollaboratorDetailsQueue.add(job.data)
    done()
  } catch (err) {
    console.log(chalk.red(err))
    if (err.response) {
      if (err.response.status === 403) {
        done()
      }
    } else {
      done(err)
    }
  }
})

fetchRepositoriesQueue.process(async (job, done) => {
  console.log(chalk.yellow(`🏃‍  Started Processing fetchRepositoriesQueue for ${job.data.login}`))

  const headers = { Authorization: `Bearer ${job.data.token}` }

  try {
    let favouriteRepositories = await Repository.find({ user: job.data.login, isFavourite: true })
    favouriteRepositories = favouriteRepositories.map(repo => repo.githubId)

    const deletedRepos = await Repository.deleteMany({ user: job.data.login })

    let res = await axios.get("https://api.github.com/user/repos?per_page=20&page=1", { headers })
    let linkHeader = []
    if (res.headers.link) {
      linkHeader = res.headers.link.split(',')
    } else {
      done()
    }
    let lastLink = linkHeader.filter(link => link.includes("last"))[0]
    let totalPages = 1

    if (lastLink) {
      let lastPage = lastLink.replace(' <https://api.github.com/user/repos?per_page=20&page=', '').replace('>; rel="last"', '')
      totalPages = parseInt(lastPage)
    }

    let repositoryFetchPromises = []
    for (let i = 1; i <= totalPages; i++) {
      repositoryFetchPromises.push(axios.get(`https://api.github.com/user/repos?per_page=20&page=${i}`, { headers }))
    }

    let responses = await Promise.all(repositoryFetchPromises)
    let short_responses = responses.map(res => res.data)
    let repositories = []
    short_responses.forEach(res => {
      res.forEach(repo => {
        const { id, node_id, name, private, description, language, owner } = repo;
        repositories.push({ githubId: id, node_id, name, private, description, language, owner })
      })
    })

    /*
    // For Filtering User's repositories only, omitting repositories shared with him/her
    if (job.data.userReposOnly) {
      repositories = res.data.filter(repo => repo.owner.login === job.data.login)
    }

    // For Filtering Private Repositories Only
    if (!job.data.includePublic) {
      repositories = res.data.filter(repo => repo.private)
    }

    */

    if (repositories.length === 0) {
      console.log(chalk.yellow(`✅  Completed Processing fetchRepositoriesQueue, No Repositories for ${job.data.login}`))
      fetchCollaboratorsQueue.add(job.data)
      done()
    }

    let saveRepositoryPromise = []
    repositories.forEach(repo => {
      let repository = new Repository({
        ...repo,
        user: job.data.login,
        owner: repo.owner.login,
        isFavourite: favouriteRepositories.includes(repo.githubId)
      })
      saveRepositoryPromise.push(repository.save())
    })

    const saved_repositories = await Promise.all(saveRepositoryPromise)
    console.log(chalk.yellow(`✅  Completed Processing fetchRepositoriesQueue for ${job.data.login}`))
    fetchCollaboratorsQueue.add(job.data)
    done()
  } catch (err) {
    console.log(chalk.red.inverse(err))
    if (err.response) {
      if (err.response.status === 403) {
        done()
      }
    }
  }
})

// Call the Worker if file is executed directly
if (require.main === module) {
  console.log(chalk.blue.inverse('----------- Started Processing Queue -----------'))

  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log(chalk.green('🔥  MongoDB Connected...'))
      if (process.argv.length > 2) {
        User.findOne({ status: 'active', login: process.argv[2] })
          .then(user => {
            if (user) {
              fetchRepositoriesQueue.add({ login: user.login, token: user.token })
            } else {
              console.log(chalk.red("❗️ User not Found"))
            }
          })
        // } else {
        //   User.find({ status: 'active' })
        //     .then(users => {
        //       if (users) {
        //         users.forEach(user => {
        //           fetchRepositoriesQueue.add({ login: user.login, token: user.token }, {
        //             // repeat: {
        //             //   every: 3600000,   // Repeat task every hour
        //             //   limit: 100
        //             // },
        //             // repeat: { cron: '00 1 * * *' }  // Repeat once every day at 1:00
        //           })
        //         })
        //       } else {
        //         console.log(chalk.red("❗️ Users not Found"))
        //       }
        //     })
      }
    })
    .catch(err => console.log(chalk.red(err)))
}