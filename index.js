const express = require('express')
const chalk = require('chalk')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const passport = require('passport')

const config = require('./config')

const { logger } = require('./middlewares/logger')

app = express()

// Middlewares
app.use(cors())
app.use(logger)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(session({
  secret: config.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.send("Welcome to GitSupreme API")
})

// Using Routes for API
app.use('/api/users', require('./routes/api/users'))
app.use('/api/collaborators', require('./routes/api/collaborators'))
app.use('/api/repositories', require('./routes/api/repositories'))
app.use('/api/activities', require('./routes/api/activities'))
app.use('/api/fetch', require('./routes/api/fetch'))
app.use('/auth', require('./routes/api/auth'))
app.use('/admin', require('./admin/'))
app.use('/arena', require('./tasks/arenaAdminPanel'))

app.get('*', function (req, res) {
  res.status(404).json({ error: true, message: 'Not Found' });
});

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log(chalk.green('🔥  MongoDB Connected...')))
  .catch(err => console.log(chalk.red(err)))

app.listen(config.PORT, () => {
  console.log(chalk.green(`👍  Server started at PORT: ${config.PORT}`))
})

module.exports = app