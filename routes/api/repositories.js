const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')
const Queue = require('../../tasks')

const Repository = require('../../models/repository')
const Collaborator = require('../../models/collaborator')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  Repository.find({ owner: req.user.login })
    .then(repositories => res.json(repositories))
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    })
})

router.get('/:name', isAuthenticated, (req, res) => {
  Repository.findOne({ owner: req.user.login, name: req.params.name })
    .then(repository => {
      if (repository) {
        Collaborator.find({ repositories: repository.id })
          .then(collaborators => {
            if (collaborators) {
              res.json({ repository, collaborators })
            } else {
              res.json({ repository })
            }
          })
          .catch(err => {
            console.log(chalk.red(err))
            res.status(500).json({ message: "Something went wrong!" })
          })
      }
      else {
        res.status(404).json({ message: "Repository not found" })
      }
    })
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    })
})

router.post('/', isAuthenticated, (req, res) => {
  res.status(501).send("Create a Repository")
})

router.put('/:name', isAuthenticated, (req, res) => {
  if (req.query.collaborator) {
    Queue.removeCollaboratorFromRepoQueue.add({
      owner: req.user.login,
      token: req.user.token,
      username: req.query.collaborator,
      repo: req.params.name,
    })
    res.json({ message: "Removing Collaborator from Repository" })
  } else if (req.body.selectedCollaborators) {
    req.body.selectedCollaborators.forEach(collaborator => {
      Queue.sendInvitationToCollaborateQueue.add({
        repo: req.params.name,
        owner: req.user.login,
        username: collaborator,
        token: req.user.token,
      })
    })
    res.json({ message: "Sending Invitation to Collaborators" })
  } else {
    res.status(501).send("Update a Repository")
  }
})

router.delete('/:name', isAuthenticated, (req, res) => {
  res.status(501).send("Delete a Repository")
})

module.exports = router