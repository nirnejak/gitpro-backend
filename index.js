const express = require('express')
const chalk = require('chalk')
const jwt = require('jsonwebtoken')
const path = require('path')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const passport = require('passport')

const config = require('./config')

const { logger } = require('./middlewares/logger')

app = express()

// Middlewares
app.use(logger)
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(session({
  secret: config.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

// Using Routes for API
app.use('/api/users', require('./routes/api/users'))
app.use('/api/collaborators', require('./routes/api/collaborators'))
app.use('/api/repositories', require('./routes/api/repositories'))
app.use('/auth', require('./routes/api/auth'))
app.use('/auth', require('./routes/api/auth'))
app.use('/admin', require('./admin/'))


app.get('/', (req, res) => {
  res.send("Welcome to GitSupreme API")
})

app.get('*', function (req, res) {
  res.status(404).render('error', { not_found: true, msg: 'Not Found' });
});

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log(chalk.green('🔥  MongoDB Connected...')))
  .catch(err => console.log(chalk.red(err)))

// const boot = require('./tasks')
// const processQueue = require('./tasks/queue')
app.listen(config.PORT, () => {
  // boot()
  // processQueue()
  console.log(chalk.green(`👍  Server started at PORT: ${config.PORT}`))
})