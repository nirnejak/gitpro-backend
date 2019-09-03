module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  PORT: process.env.PORT || 5000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'THIS_IS_MY_SESSION_SECRET',
  
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://user:user1234@cluster0-xnkdm.mongodb.net/gitsupreme',

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '9eef2cf40dfd04593ad0',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'a599171516a2fb04941c8a3a3d06862dbbaca7d8'
}