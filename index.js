const express = require('express')
const chalk = require('chalk')
const jwt = require('jsonwebtoken')
const path = require('path')
const session = require('express-session')
const exphbs = require('express-handlebars')
const sassMiddleware = require('node-sass-middleware')

const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const passport = require('passport')

const config = require('./config')

const { logger } = require('./middlewares/logger')

app = express()

mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true
})
  .then(() => console.log(chalk.green('🔥  MongoDB Connected...')))
  .catch(err => console.log(chalk.red(err)))

// Middlewares
app.use(logger)
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


// Template Settings
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// Sass Middleware
app.use(sassMiddleware({
  src: path.join(__dirname, 'sass'),
  dest: path.join(__dirname, 'public', 'css'),
  prefix: '/css',
  outputStyle: "compressed",
  // debug: config.NODE_ENV !== 'production',
  debug: false,
  response: false
}))

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

app.get('/dashboard', (req, res) => {
  res.render('dashboard')
})

app.listen(config.PORT, () => {
  console.log(chalk.green(`👍  Server started at PORT: ${config.PORT}`))
})