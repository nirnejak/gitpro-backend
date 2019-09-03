const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  let context = { title: 'GitHub Supreme' }
  res.render('index', context)
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/dashboard', (req, res) => {
  res.render('dashboard')
})

router.get('/teams', (req, res) => {
  res.render('teams')
})

router.get('/contributors', (req, res) => {
  res.render('contributors')
})

router.get('/repositories', (req, res) => {
  res.render('repositories')
})

router.get('/settings', (req, res) => {
  res.render('settings')
})

module.exports = router