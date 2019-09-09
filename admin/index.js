const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')

const User = require('../models/user')

AdminBro.registerAdapter(AdminBroMongoose)
const adminBro = new AdminBro({
  resources: [User],
  rootPath: '/admin'
})

module.exports = adminRouter = AdminBroExpress.buildRouter(adminBro)