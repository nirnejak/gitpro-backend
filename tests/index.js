const mongoose = require('mongoose')
const Redis = require("ioredis");

const config = require('../config')

describe('Connection', () => {
  // TEST: MongoDB Connection
  it('it should connect to mongoDB Server', (done) => {
    mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
      .then(() => done())
      .catch(err => done(err))
  })

  // TEST: Redis Connection
  it('it should connect to Redis Server', (done) => {
    const redis = new Redis(config.REDIS_URL ? config.REDIS_URL : {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      db: 0
    })
    done()
  })
})