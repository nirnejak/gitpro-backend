const chalk = require('chalk')
const mongoose = require('mongoose')

const config = require('../../config')

const User = require('../../models/user')

const fetchRepositoriesQueue = require('./fetchRepositoriesQueue')

// Call the Worker if file is executed directly
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log(chalk.green('🔥  MongoDB Connected...'))
    User.find({}, async (err, users) => {
      if (err) {
        console.log(chalk.red("❗️  Users not found!"))
      } else {
        users.forEach(user => fetchRepositoriesQueue.add({ login: user.login }))
      }
    })
  })
  .catch(err => console.log(chalk.red(err)))