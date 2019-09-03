const express = require('express')
const mongoose = require('mongoose')

const userModel = require('../../models/users')

// mongoose.connect(process.env.MONGO_URI || 'mongodb://ram:fakepass1@ds157742.mlab.com:57742/gitsupreme')
//   .then(() => {
//     console.log(chalk.green('MongoDB Connected...'))
//   })
//   .catch(err => console.log(chalk.red(err)))

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