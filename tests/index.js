const mongoose = require('mongoose')
const Redis = require("ioredis");

const config = require('../config')

describe('Connection', () => {
  // TEST: MongoDB Connection
  it('it should connect to mongoDB Server', (done) => {
    mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => done())
      .catch(err => done(err))
  })

  // TEST: Redis Connection
  it('it should connect to Redis Server', (done) => {
    const redis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      user: config.REDIS_USER,
      password: config.REDIS_PASSWORD,
      db: 0
    })
    done()
  })
})