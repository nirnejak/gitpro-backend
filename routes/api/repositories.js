const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')

const Repository = require('../../models/repository')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  Repository.find({ owner: req.user.login }, (err, repositories) => {
    if (err) {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    } else {
      res.json(repositories)
    }
  })
})

router.get('/:name', isAuthenticated, (req, res) => {
  Repository.findOne({ owner: req.user.login, name: req.params.name }, (err, repository) => {
    if (err) {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    } else {
      if (repository) res.json(repository)
      else res.status(404).json({ message: "Repository not found" })
    }
  })
})

router.post('/', isAuthenticated, (req, res) => {
  res.status(501).send("Create a Repository")
})

router.put('/:name', isAuthenticated, (req, res) => {
  res.status(501).send("Update a Repository")
})

router.delete('/:name', isAuthenticated, (req, res) => {
  res.status(501).send("Delete a Repository")
})

module.exports = router