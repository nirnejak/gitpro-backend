const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')
const chalk = require('chalk')

const User = require('../models/user')
const Collaborator = require('../models/collaborator')
const Repository = require('../models/repository')
const Activity = require('../models/activity')

AdminBro.registerAdapter(AdminBroMongoose)
const adminBro = new AdminBro({
  resources: [
    {
      resource: User,
      options: {
        properties: {
          token: { isVisible: { list: false, filter: false, show: true, edit: false } },
          avatar_url: { isVisible: { list: false, filter: false, show: true, edit: false } },
          githubId: { isVisible: { list: false, filter: false, show: true, edit: false } },
        }
      }
    },
    {
      resource: Repository,
      options: {
        properties: {
          node_id: { isVisible: { list: false, filter: false, show: true, edit: false } },
          description: { isVisible: { list: false, filter: false, show: true, edit: false } },
          githubId: { isVisible: { list: false, filter: false, show: true, edit: false } },
        }
      }
    },
    {
      resource: Collaborator,
      options: {
        properties: {
          githubId: { isVisible: { list: false, filter: false, show: true, edit: false } },
          avatar_url: { isVisible: { list: false, filter: false, show: true, edit: false } },
        }
      }
    },
    {
      resource: Activity,
      options: {
        properties: {}
      }
    }
  ],
  branding: {
    companyName: 'GitPro',
    softwareBrothers: false,
    logo: 'https://www.inkoop.io/images/Inkoop_logo.jpeg'
  },
  rootPath: '/admin'
})

// module.exports = adminRouter = AdminBroExpress.buildRouter(adminBro)
module.exports = adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    try {
      const user = await User.findOne({ email: email })
      if (user.login === password) return user
      else return null
    } catch (err) {
      console.log(chalk.red(err))
    }
  },
  cookieName: 'cookieName',
  cookiePassword: 'cookiePassword'
})