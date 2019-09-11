const express = require('express')

const isAuthenticated = require('../../middlewares/auth')

const User = require('../../models/user')
const Repository = require('../../models/repository')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  Repository.find({ owner: req.user.login }, (err, repositories) => {
    if (err) {
      res.status(404).json({ message: "Repositories not Found" })
    } else {
      res.json(repositories)
    }
  })
})

router.get('/:name', isAuthenticated, (req, res) => {
  Repository.findOne({ owner: req.user.login, name: req.params.name }, (err, repository) => {
    if (err) {
      res.status(404).json({ message: "Repository not found" })
    } else {
      res.json(repository)
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