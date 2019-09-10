const express = require('express')

const Users = require('../../models/user')

const router = express.Router();

router.get('/', (req, res) => {
  res.send("Get Users")
})

router.get('/:login', (req, res) => {
  // TODO: replace hardcoded login with req.user.login
  User.findOne({ login: req.params.login }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      let data = {
        total_repositories: user.repositories.length,
        total_collaborators: user.collaborators.length
      }
      data = { ...data, ...user._doc }
      res.json(data)
    }
  })
})

router.post('/', (req, res) => {
  res.status(501).send("Create a User")
})

router.put('/:login', (req, res) => {
  res.status(501).send("Update a User")
})

router.delete('/:login', (req, res) => {
  res.status(501).send("Delete a User")
})

module.exports = router