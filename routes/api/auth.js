const express = require('express')
const passport = require('passport')
const axios = require('axios')
const chalk = require('chalk')

const config = require('../../config')

const User = require('../../models/user')
const fetchRepositories = require('../../tasks/fetchRepositories')

const router = express.Router();


const GitHubStrategy = require('passport-github2').Strategy;

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use(new GitHubStrategy({
  clientID: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  callbackURL: config.GITHUB_CALLBACK_URL,
},
  function (accessToken, refreshToken, profile, done) {
    User.findOne({ githubId: profile.id }, (err, db_user) => {
      if (err) {
        done(err)
      } else {
        if (db_user) {
          done(null, {
            _id: db_user._id,
            login: db_user.login,
            token: db_user.token,
            githubId: db_user.githubId
          })
        } else {
          let user = new User({
            name: profile.displayName,
            login: profile.username,
            token: accessToken,
            githubId: profile.id,
            avatar_url: profile._json.avatar_url,
            email: profile.email
          })
          user.save()
            .then(saved_user => {
              fetchRepositories(saved_user)
              done(null, {
                _id: user._id,
                login: user.login,
                token: user.token,
                githubId: user.githubId
              })
            })
            .catch(err => done(err))
        }
      }
    })

  }
));
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo', 'admin'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router