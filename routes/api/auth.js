const express = require('express')
const passport = require('passport')
const chalk = require('chalk')

const config = require('../../config')

const User = require('../../models/user')

const router = express.Router();


const GitHubStrategy = require('passport-github2').Strategy;

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use(new GitHubStrategy({
  clientID: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  callbackURL: config.GITHUB_CALLBACK_URL
},
  function (accessToken, refreshToken, profile, done) {
    User.findOne({ githubId: profile.id }, (err, db_user) => {
      if (err) {
        let user = new User({
          name: profile.displayName,
          login: profile.username,
          token: accessToken,
          githubId: profile.id,
          avatar_url: profile._json.avatar_url
        })
        // TODO: Start Fetching the Repositories and Contributors
        user.save()
          .then(user => done(null, user))
          .catch(err => done(err))
      } else {
        done(null, db_user)
      }
    })

  }
));
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router