const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')

const User = require('../../models/user')
const Collaborator = require('../../models/collaborator')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  // console.log(req.query.name)
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      res.json(user.collaborators)
    }
  })
})

router.get('/:login', isAuthenticated, (req, res) => {
  // TODO: New Query Based on New Model
  // Collaborator.findOne({ login: req.params.login })
  //   .populate("repo")
  //   .then(collaborator => {
  //     res.json(collaborator)
  //   })
  //   .catch(err => {
  //     console.log(chalk.red(err))
  //     res.status(404).json({ message: "Collaborator not Found" })
  //   })
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      let collaborator = user.collaborators.filter(collaborator => collaborator.login === req.params.login)
      if (collaborator.length >= 1) {
        collaborator = collaborator[0]
        res.json(collaborator)
      } else {
        res.status(404).json({ message: "Collaborator not found" })
      }
    }
  })
})

router.post('/', isAuthenticated, (req, res) => {
  res.status(501).send("Create a Collaborator")
})

router.put('/:login', isAuthenticated, (req, res) => {
  res.status(501) / send("Update a Collaborator")
})

router.delete('/:login', isAuthenticated, (req, res) => {
  res.status(501).send("Delete a Collaborator")
})

module.exports = router