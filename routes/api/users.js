const express = require('express')
const chalk = require('chalk')

const isAuthenticated = require('../../middlewares/auth')

const User = require('../../models/user')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  User.find({})
    .then(users => res.json(users))
    .catch(err => {
      console.log(chalk.red(err))
      res.status(500).json({ message: "Something went wrong!" })
    })
})

router.get('/:login', isAuthenticated, (req, res) => {
  User.findOne({ login: req.params.login })
    .then(user => {
      if (user) {
        let data = {
          total_repositories: user.repositories.length,
          total_collaborators: user.collaborators.length
        }
        data = { ...data, ...user._doc }
        res.json(data)
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
  res.status(501).send("Delete a User")
})

module.exports = router