const express = require('express')
const chalk = require('chalk')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const passport = require('passport')
const Sentry = require('@sentry/node')

const config = require('./config')

const { logger } = require('./middlewares/logger')

app = express()
Sentry.init({ dsn: config.SENTRY_DSN })

// Middlewares
if (config.NODE_ENV === 'production') {
  app.use(Sentry.Handlers.requestHandler())
}
app.use(cors())

app.use(logger)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
  secret: config.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.send("Welcome to GitPro API")
})

app.get('/debug-sentry', (req, res) => {
  throw new Error('My first Sentry error!');
});

// Using Routes for API
app.use('/api/users', require('./routes/api/users'))
app.use('/api/collaborators', require('./routes/api/collaborators'))
app.use('/api/repositories', require('./routes/api/repositories'))
app.use('/api/activities', require('./routes/api/activities'))
app.use('/api/fetch', require('./routes/api/fetch'))
app.use('/auth', require('./routes/api/auth'))
app.use('/admin', require('./admin/'))

app.get('*', function (req, res) {
  res.status(404).json({ error: true, message: 'Not Found' })
})

if (config.NODE_ENV === 'production') app.use(Sentry.Handlers.errorHandler())

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(chalk.green('🔥  MongoDB Connected...')))
  .catch(err => console.log(chalk.red(err)))

app.listen(config.PORT, () => {
  console.log(chalk.green(`👍  Server started at PORT: ${config.PORT}`))
})

module.exports = app