const express = require('express')
const passport = require('passport')
const chalk = require('chalk')
const jwt = require('jsonwebtoken')

const config = require('../../config')

const User = require('../../models/user')
const Queue = require('../../tasks')

const router = express.Router();


const GitHubStrategy = require('passport-github2').Strategy;

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

const githubConfig = {
  clientID: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  callbackURL: config.GITHUB_CALLBACK_URL,
}

passport.use(new GitHubStrategy(githubConfig, (accessToken, refreshToken, profile, done) => {
  User.findOne({ githubId: profile.id })
    .then(databaseUser => {
      if (databaseUser) {
        databaseUser.token = accessToken
        return databaseUser.save()
      } else {
        const user = new User({
          name: profile.displayName || '',
          login: profile.username,
          token: accessToken,
          githubId: profile.id,
          avatar_url: profile._json.avatar_url || '',
          email: profile.emails.length ? profile.emails[0].value : ''
        })
        return user.save()
      }
    })
    .then(user => {
      const { _id, login, token, githubId } = user
      Queue.fetchRepositoriesQueue.add({ login, token })
      done(null, { _id, login, token, githubId })
    })
    .catch(err => done(err))
}));

router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo', 'admin'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/auth/github' }), (req, res) => {
  let user = req.user;
  jwt.sign({ user }, config.JWT_TOKEN_SECRET, { expiresIn: '1 day' }, (err, token) => {
    user["jwtToken"] = token
    res.redirect(`${config.CLIENT_URL}dashboard?token=${token}&login=${user.login}`)
  })
});

module.exports = router