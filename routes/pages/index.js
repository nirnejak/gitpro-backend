const express = require('express')

const isLoggedIn = require('../../middlewares/auth')
const User = require('../../models/user')

const router = express.Router()

router.get('/', (req, res) => {
  let context = { title: 'GitHub Supreme' }
  res.render('index', context)
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/dashboard', isLoggedIn, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
      user["total_repositories"] = user.repositories.length
      user["total_collaborators"] = user.collaborators.length
      res.render('dashboard', { user })
    }
  })
})

router.get('/teams', isLoggedIn, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
      res.render('teams', { user })
    }
  })
})

router.get('/collaborators', isLoggedIn, (req, res) => {
  User.findOne({ login: req.user.login }, (err, user) => {
    if (err) {
      res.redirect('/login')
    } else {
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