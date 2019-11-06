const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')
const Queue = require('../../tasks')

const User = require('../../models/user')
const Collaborator = require('../../models/collaborator')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  // console.log(req.query.name)
  Collaborator.find({ owner: req.user.login })
    .then(collaborators => res.json(collaborators))
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong" })
    })
})

router.get('/:login', isAuthenticated, (req, res) => {
  Collaborator.findOne({ owner: req.user.login, login: req.params.login })
    .populate("repositories")
    .then(collaborator => {
      if (collaborator) res.json(collaborator)
      else res.status(404).json({ message: "Collaborator not found" })
    })
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong" })
    })
})

router.post('/', isAuthenticated, (req, res) => {
  Collaborator.findOne({ owner: req.user.login, login: req.body.login })
    .then(collaborator => {
      if (collaborator) {
        res.json({ success: false, message: "Collaborator already exists" })
      } else {
        collaborator = Collaborator({
          owner: req.user.login,
          login: req.body.login,
          githubId: req.body.id,
          avatar_url: req.body.avatar_url,
          type: req.body.type
        })
        collaborator.save()
          .then(collaborator => {
            req.body.repositories.forEach(repo => {
              Queue.sendInvitationToCollaborateQueue.add({
                owner: req.user.login,
                token: req.user.token,
                username: collaborator.login,
                repo,
              })
            })
            res.json({ success: true, message: "Collaborator created successfully", collaborator })
          })
          .catch(err => {
            console.log(chalk.red(err))
            res.status(500).json({ message: "Something went wrong" })
          })
      }
    })
})

router.put('/:login', isAuthenticated, (req, res) => {
  if (req.query.repo) {
    Queue.removeCollaboratorFromRepoQueue.add({
      user: req.user.login,
      token: req.user.token,
      username: req.params.login,
      owner: req.query.owner,
      repo: req.query.repo,
    })
    res.json({ message: "Removing Collaborator from Repository" })
  } else if (req.body.selectedRepositories) {
    req.body.selectedRepositories.map(repo => {
      Queue.sendInvitationToCollaborateQueue.add({
        repo,
        owner: req.user.login,
        username: req.params.login,
        token: req.user.token,
      })
    })
    res.json({ message: "Adding Collaborator to Repositories" })
  } else {
    res.status(501).send("Update a Collaborator")
  }
})

router.delete('/:login', isAuthenticated, (req, res) => {
  Collaborator.findOne({ owner: req.user.login, login: req.params.login })
    .populate("repositories")
    .then(collaborator => {
      if (collaborator) {
        if (collaborator.repositories.length === 0) {
          collaborator.remove()
        } else {
          collaborator.repositories.forEach((repo, index) => {
            Queue.removeCollaboratorFromRepoQueue.add({
              user: req.user.login,
              token: req.user.token,
              username: req.params.login,
              owner: repo.owner,
              repo: repo.name,
              last: index === collaborator.repositories.length - 1
            })
          })
        }
        res.json({ message: "Removing Collaborator" })
      } else {
        res.status(404).json({ message: "Collaborator not found" })
      }
    })
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong" })
    })
})

module.exports = router