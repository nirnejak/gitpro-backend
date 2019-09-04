const express = require('express')

const User = require('../../models/user')

const router = express.Router()

router.get('/', (req, res) => {
  let context = { title: 'GitHub Supreme' }
  res.render('index', context)
})

router.get('/login', (req, res) => {
  res.render('login')
})


function isLoggedIn(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/dashboard', isLoggedIn, (req, res) => {
  console.log(req.user)
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
      user["total_repositories"] = user.repositories.length
      user["collaborators"]
      res.render('dashboard', { user })
    }
  })
})

router.get('/teams', isLoggedIn, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
      user["total_repositories"] = user.repositories.length
      res.render('teams', { user })
    }
  })
})

router.get('/collaborators', isLoggedIn, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
      user["total_repositories"] = user.repositories.length
      res.render('collaborators', { user })
    }
  })
})

router.get('/repositories', isLoggedIn, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
      res.render('repositories', { user })
    }
  })
})

router.get('/settings', isLoggedIn, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
      user["total_repositories"] = user.repositories.length
      res.render('settings', { user })
    }
  })
})

module.exports = router