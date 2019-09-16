const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')
const Queue = require('../../tasks')

const router = express.Router();

router.get('/repositories', isAuthenticated, (req, res) => {
  Queue.fetchRepositoriesQueue.add({
    login: req.user.login,
    token: req.user.token,
  })
  res.json({ message: "Fetching Repositories" })
})

router.get('/collaborators', isAuthenticated, (req, res) => {
  Queue.fetchCollaboratorsQueue.add({
    login: req.user.login,
    token: req.user.token,
  })
  res.json({ message: "Fetching Collaborators" })
})

module.exports = router