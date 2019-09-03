const express = require('express')

const router = express.Router();

router.get('/', (req, res) => {
  res.send("Get Users")
})

router.get('/:id', (req, res) => {
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