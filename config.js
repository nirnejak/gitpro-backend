module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  PORT: process.env.PORT || 5000,
  SESSION_SECRET: process.env.SESSION_SECRET || '894f40f9ee92e4c4c7ffd56d781f4167',
  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET || 'f0156fab3daf3c5228447fda0e191b01',

  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://user:user1234@cluster0-xnkdm.mongodb.net/gitsupreme',

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '28670f88156e4ce590f5',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'ca52a60c219893f9f7500641549951812fc97bf8',
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://127.0.0.1:5000/auth/github/callback',

  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_USER: process.env.REDIS_USER || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
}