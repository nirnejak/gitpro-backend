const express = require('express')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const path = require('path')
const exphbs = require('express-handlebars')
const sassMiddleware = require('node-sass-middleware')

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
  debug: true,
  response: false
}))

app.get('/', (req, res) => {
  let context = {
    title: 'GitHub Supreme'
  }
  res.render('index', context)
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(chalk.green(`Server started at PORT: ${PORT}`))
})