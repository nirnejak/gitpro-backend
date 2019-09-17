const express = require('express')
const chalk = require('chalk')
const axios = require('axios')

const isAuthenticated = require('../../middlewares/auth')
const Queue = require('../../tasks')
const getDiffs = require('../../utils/git')

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

router.get('/users', isAuthenticated, (req, res) => {
  if (req.query.q) {
    const url = `https://api.github.com/search/users?q=${req.query.q}`
    axios.get(url, { headers: { Authorization: `Bearer ${req.user.token}` } })
      .then(response => {
        res.json(response.data.items.filter(user => user.login !== req.user.login))
      })
      .catch(err => {
        console.log(chalk.red(err))
        res.status(500).json({ message: "Something went wrong" })
      })
  } else {
    res.json([])
  }
})

router.get('/activity', isAuthenticated, (req, res) => {
  getDiffs({
    owner: req.user.login,
    author: 'nirnejak',
    repoName: 'graphql-app',
    after: '2019-08-16',
    before: '2019-09-17'
  })
})

module.exports = router