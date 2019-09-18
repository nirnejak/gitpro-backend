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
  /* TODO: Search in DB for Diff
  if it exists return to the user
  if it doesn't start the process and send the data to the user also store in the database
  */
  getDiffs({
    owner: req.user.login,
    author: req.query.author,
    repoName: req.query.repo,
    after: req.query.after,
    before: req.query.before
  })
    .then(diffs => res.json(diffs))
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong" })
    })
})

module.exports = router