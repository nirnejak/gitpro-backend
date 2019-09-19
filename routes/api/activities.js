const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')
const Activity = require('../../models/activity')

const getActivity = require('../../utils/git')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  const query = { owner: req.user.login }

  if (req.query.author) query["author"] = req.query.author
  if (req.query.repository) query["repository"] = req.query.repository
  if (req.query.after) query["after"] = req.query.after
  if (req.query.before) query["before"] = req.query.before

  Activity.find(query)
    .then(activities => res.json(activities))
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong" })
    })
})

router.get('/:author', isAuthenticated, (req, res) => {
  const options = {
    owner: req.user.login,
    author: req.params.author,
    repository: req.query.repository,
    after: req.query.after,
    before: req.query.before
  }
  Activity.findOne(options)
    .then(activity => {
      if (activity) return activity
      else return getActivity({ ...options, token: req.user.token, })
    })
    .then(activity => res.json(activity))
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong" })
    })
})

module.exports = router