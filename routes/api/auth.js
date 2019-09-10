const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const url = require('url')

const config = require('../../config')

const User = require('../../models/user')
const fetchData = require('../../tasks/fetchData')

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
  User.findOne({ githubId: profile.id }, (err, db_user) => {
    if (err) {
      done(err)
    } else {
      if (db_user) {
        let { _id, login, token, githubId } = db_user
        done(null, { _id, login, token, githubId })
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
            fetchData(saved_user)
            let { _id, login, token, githubId } = saved_user
            done(null, { _id, login, token, githubId })
          })
          .catch(err => done(err))
      }
    }
  })
}));

router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo', 'admin'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  if (config.NODE_ENV === 'production') {
    res.redirect('https://github-supreme.netlify.com/dashboard');
  } else {
    let user = req.user;
    jwt.sign({ user }, config.JWT_TOKEN_SECRET, { expiresIn: '2 days' }, (err, token) => {
      // TODO: Find a way to send User data and jwtToken - token
      user["jwtToken"] = token
      res.redirect(`http://localhost:8080/dashboard?token=${token}&login=${user.login}`)
    })
  }
});

module.exports = router