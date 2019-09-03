const express = require('express')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const path = require('path')
const exphbs = require('express-handlebars')
const sassMiddleware = require('node-sass-middleware')
const passport = require('passport')

const { logger } = require('./middlewares/logger')

app = express()

// Middlewares
app.use(logger)
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

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

const GitHubStrategy = require('passport-github').Strategy;
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || '9eef2cf40dfd04593ad0' || '28670f88156e4ce590f5',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'a599171516a2fb04941c8a3a3d06862dbbaca7d8' || 'ca52a60c219893f9f7500641549951812fc97bf8',
  callbackURL: "http://127.0.0.1:5000/auth/github/callback",

},
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});




app.get('/', (req, res) => {
  let context = { title: 'GitHub Supreme' }
  res.render('index', context)
})

app.get('/login', (req, res) => {
  res.render('login')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(chalk.green.inverse(`Server started at PORT: ${PORT}`))
})