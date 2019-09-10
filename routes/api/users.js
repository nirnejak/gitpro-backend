const express = require('express')

const Users = require('../../models/user')

const router = express.Router();

router.get('/', (req, res) => {
  res.send("Get Users")
})

router.get('/:login', (req, res) => {
  User.findOne({ login: req.params.login }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      user["total_repositories"] = user.repositories.length
      user["total_collaborators"] = user.collaborators.length
      res.json(user)
    }
  })
  res.send("Get a User")
})

router.post('/', (req, res) => {
  res.send("Create a User")
})

router.put('/:id', (req, res) => {
  res.send("Update a User")
})

router.delete('/:id', (req, res) => {
  res.send("Delete a User")
})

module.exports = router