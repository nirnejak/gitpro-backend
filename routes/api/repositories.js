const express = require('express')

const isAuthenticated = require('../../middlewares/auth')

const User = require('../../models/user')
const Repository = require('../../models/repository')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      res.json(user.repositories)
    }
  })
})

router.get('/:name', isAuthenticated, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      let repository = user.repositories.filter(repository => repository.name === req.params.name)
      if (repository.length >= 1) {
        repository = repository[0]
        res.json(repository)
      } else {
        res.status(404).json({ message: "Repository not found" })
      }
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