module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  PORT: process.env.PORT || 5000,
  SESSION_SECRET: process.env.SESSION_SECRET || '894f40f9ee92e4c4c7ffd56d781f4167',
  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET || 'f0156fab3daf3c5228447fda0e191b01',

  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://user:user1234@cluster0-xnkdm.mongodb.net/gitsupreme',

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '9eef2cf40dfd04593ad0',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'a599171516a2fb04941c8a3a3d06862dbbaca7d8',
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://127.0.0.1:5000/auth/github/callback',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:8080/',

  SENTRY_DSN: process.env.SENTRY_DSN || '',
  
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
}