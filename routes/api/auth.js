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
            avatar_url: profile._json.avatar_url
          })
          user.save()
            .then(user_item => {
              // TODO: Move HTTP Call into a Message Queue or Background Process
              axios
                .get("https://api.github.com/user/repos", { headers: { Authorization: `Bearer ${accessToken}`, } })
                .then(res => {
                  user.repositories = res.data.map(repo => {
                    const { id, node_id, name, private, description, language } = repo;
                    return { id, node_id, name, private, description, language }
                  })
                  user.save()
                    .then(saved_user => {
                      saved_user.repositories.forEach(repository => {
                        axios
                          .get(`https://api.github.com/repos/${saved_user.login}/${repository.name}/collaborators`, { headers: { Authorization: `Bearer ${accessToken}`, } })
                          .then(res => {
                            if (res.data.length > 1) {
                              let collaborators = res.data.filter(contributor => contributor.login !== saved_user.login)
                              collaborators = collaborators.map(contributor => ({
                                login: contributor.login,
                                id: contributor.id,
                                type: contributor.type
                              }))
                              // TODO: Store Collaborators in MongoDB Database
                            }
                          })
                      })
                    })
                })
                .catch(err => console.log(chalk.red(err)))

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
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router