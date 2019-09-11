const express = require('express')

const isAuthenticated = require('../../middlewares/auth')

const Users = require('../../models/user')

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  res.send("Get Users")
})

router.get('/:login', isAuthenticated, (req, res) => {
  User.findOne({ login: req.params.login }, (err, user) => {
    if (err) {
      res.status(500).json({ message: "Something went wrong!" })
    } else {
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
    }
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