const express = require('express')
const chalk = require('chalk')
const jwt = require('jsonwebtoken')
const path = require('path')
const session = require('express-session')
const exphbs = require('express-handlebars')
const sassMiddleware = require('node-sass-middleware')
const mongoose = require('mongoose')
const passport = require('passport')

const { logger } = require('./middlewares/logger')

app = express()

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://user:user1234@cluster0-xnkdm.mongodb.net/gitsupreme', {
  useNewUrlParser: true
})
  .then(() => console.log(chalk.green('🔥 MongoDB Connected...')))
  .catch(err => console.log(chalk.red(err)))

// Middlewares
app.use(logger)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'THIS_IS_MY_SESSION_SECRET', 
  resave: true, 
  saveUninitialized: true
}))

// Template Settings
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// Sass Middleware
app.use(sassMiddleware({
  src: path.join(__dirname, 'sass'),
  dest: path.join(__dirname, 'public', 'css'),
  prefix: '/css',
  outputStyle: "compressed",
  debug: process.env.NODE_ENV !== 'production',
  response: false
}))

// Set a static folder using Middleware
app.use(express.static(path.join(__dirname, 'public')))

// Using Routes for API
app.use('/api/users', require('./routes/api/users'))
app.use('/auth', require('./routes/api/auth'))


app.get('/', (req, res) => {
  let context = { title: 'GitHub Supreme' }
  res.render('index', context)
})

app.get('/login', (req, res) => {
  res.render('login')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(chalk.green(`👍 Server started at PORT: ${PORT}`))
})