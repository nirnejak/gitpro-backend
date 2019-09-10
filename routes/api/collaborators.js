const express = require('express')

const Users = require('../../models/user')
const Collaborators = require('../../models/collaborator')

const router = express.Router();

router.get('/', (req, res) => {
  // console.log(req.query.name)
  // TODO: replace hardcoded login with req.user.login
  User.findOne({ login: "nirnejak" }, (err, user) => {
    if (err) {
      res.status(404).json({ message: "User not Found" })
    } else {
      res.json(user.collaborators)
    }
  })
})

router.get('/:login', (req, res) => {
  // TODO: replace hardcoded login with req.user.login
  User.findOne({ login: "nirnejak" }, (err, user) => {
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

router.post('/', (req, res) => {
  res.status(501).send("Create a Collaborator")
})

router.put('/:login', (req, res) => {
  res.status(501) / send("Update a Collaborator")
})

router.delete('/:login', (req, res) => {
  res.status(501).send("Delete a Collaborator")
})

module.exports = router