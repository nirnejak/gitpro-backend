const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')

const User = require('../../models/user')
const Collaborator = require('../../models/collaborator')
const Repository = require('../../models/repository')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  User.find({ status: "active" })
    .then(users => res.json(users))
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    })
})

router.get('/:login', isAuthenticated, (req, res) => {
  User.findOne({ login: req.params.login, status: "active" })
    .then(user => {
      if (user) {
        if (req.query.stats) {
          let data = {}
          Collaborator.find({ owner: req.params.login })
            .then(collaborators => {
              data["total_collaborators"] = collaborators.length
              Repository.find({ owner: req.params.login })
                .then(repositories => {
                  data["total_repositories"] = repositories.length
                  data["favourite_repositories"] = repositories.filter(repo => repo.isFavourite)
                  data = { ...data, ...user._doc }
                  res.json(data)
                })
            })
        } else {
          res.json(user)
        }
      } else {
        res.status(404).json({ message: "User not Found" })
      }
    })
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    })
})

router.post('/', isAuthenticated, (req, res) => {
  res.status(501).send("Create a User")
})

router.put('/:login', isAuthenticated, (req, res) => {
  res.status(501).send("Update a User")
})

router.delete('/:login', isAuthenticated, (req, res) => {
  User.findOne({ login: req.params.login, status: "active" })
    .then(user => {
      user.status = "deactive"
      user.save(user => {
        res.json({ message: "Account Deactivated Successfully" })
      })
    })
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    })
})

module.exports = router