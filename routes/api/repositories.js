const express = require('express')

const Users = require('../../models/user')
const Repositories = require('../../models/repository')

const router = express.Router();

router.get('/', (req, res) => {
  // TODO: Replace Hardcoded user to req.user.login
  User.findOne({ login: "nirnejak" }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      res.json(user.repositories)
    }
  })
})

router.get('/:name', (req, res) => {
  // TODO: Replace Hardcoded user to req.user.login
  User.findOne({ login: "nirnejak" }, (err, user) => {
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

router.post('/', (req, res) => {
  res.send("Create a Repository")
})

router.put('/:name', (req, res) => {
  res.send("Update a Repository")
})

router.delete('/:name', (req, res) => {
  res.send("Delete a Repository")
})

module.exports = router