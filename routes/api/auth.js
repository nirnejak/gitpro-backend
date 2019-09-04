const express = require('express')
const passport = require('passport')
const axios = require('axios')
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
      } else {
        if (db_user) {
          done(null, db_user)
        } else {
          let user = new User({
            name: profile.displayName,
            login: profile.username,
            token: accessToken,
            githubId: profile.id,
            avatar_url: profile._json.avatar_url
          })
          user.save()
            .then(user_item => {
              axios.get(`https://api.github.com/users/${profile.username}/repos`)
                .then(res => {
                  console.log(user)
                  user.repositories = res.data.map(repo => {
                    return {
                      id: repo.id,
                      node_id: repo.node_id,
                      name: repo.name,
                      private: repo.private,
                      description: repo.description,
                      language: repo.language,
                    }
                  })
                  user.save()
                    .then(user_item => {
                      // TODO: Start Fetching the Contributors for each repositories
                    })
                    .catch(err => console.log(chalk.red(err)))
                })
                .catch(err => console.log(chalk.red(err)))
              done(null, user)
            })
            .catch(err => done(err))
        }
      }
    })

  }
));
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router