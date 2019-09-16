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
    .then(collaborators => {
      res.json(collaborators)
    })
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
  res.status(501).send("Create a Collaborator")
})

router.put('/:login', isAuthenticated, (req, res) => {
  if (req.query.repo) {
    Queue.removeCollaboratorFromRepoQueue.add({
      owner: req.user.login,
      token: req.user.token,
      username: req.params.login,
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
  // TODO: Implement Delete Collaborator
  res.status(501).send("Delete a Collaborator")
})

module.exports = router