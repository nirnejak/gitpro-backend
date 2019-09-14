const mongoose = require('mongoose')
const Redis = require("ioredis");

const config = require('../config')

describe('Connection', () => {
  // TEST: MongoDB Connection
  it('it should connect to mongoDB Server', (done) => {
    mongoose.connect(config.MONGO_URI, { useNewUrlParser: true })
      .then(() => done())
      .catch(err => console.log(err))
  })

  // TEST: Redis Connection
  it('it should connect to Redis Server', (done) => {
    try {
      const redis = new Redis({
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
        db: 0
      });
      done()
    } catch (e) {
      done(e)
    }
  })
})