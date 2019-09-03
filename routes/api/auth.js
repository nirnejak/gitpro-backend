const express = require('express')
const passport = require('passport')
const chalk = require('chalk')

const User = require('../../models/user')

const router = express.Router();

const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || '9eef2cf40dfd04593ad0' || '28670f88156e4ce590f5',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'a599171516a2fb04941c8a3a3d06862dbbaca7d8' || 'ca52a60c219893f9f7500641549951812fc97bf8',
  callbackURL: "http://127.0.0.1:5000/auth/github/callback"
},
  function (accessToken, refreshToken, profile, done) {
    let user = new User({
      name: profile.displayName,
      login: profile.username,
      token: accessToken,
      githubId: profile.id
    })
    user.save()
      .then(user => {
        console.log(user)
        return done(null, user)
      })
      .catch(err => {
        console.log(chalk.red(err));
        return done(null, false)
      })
  }
));
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router