const jwt = require('jsonwebtoken')
const chalk = require('chalk')

const config = require('../config')

exports.authMiddleware = (req, res, next) => {
  if (req.url.includes("/api") && ["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ")
      const bearerToken = bearer[1]
      req["jwtToken"] = bearerToken
      jwt.verify(bearerToken, config.JWT_TOKEN_SECRET, (err, authData) => {
        if (err) {
          console.log(chalk.green.inverse(err))
          res.sendStatus(403) // Forbidden
        } else {
          req["user"] = authData.user
          next()
        }
      })
    } else {
      res.sendStatus(403) // Forbidden
    }
  }
  next()
}