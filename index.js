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

const { logger } = require('./middlewares/logger')

app = express()

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://user:user1234@cluster0-xnkdm.mongodb.net/gitsupreme', {
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
  secret: process.env.SESSION_SECRET || 'THIS_IS_MY_SESSION_SECRET',
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
  debug: process.env.NODE_ENV !== 'production',
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(chalk.green(`👍  Server started at PORT: ${PORT}`))
})