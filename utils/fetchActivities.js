const chalk = require('chalk')

const Activity = require('../models/activity')

const executeSystemCommand = require('./exec')

function getActivity(params) {
  const { owner, author, repository, after, before, token } = params

  const url = `https://${owner}:${token}@github.com/${owner}/${repository}.git`

  return Activity.findOne({ owner, author, repository, after, before })
    .then(async (activity) => {
      if (activity) {
        await executeSystemCommand(`mkdir -p temp/${activity._id} && cd temp/${activity._id} && git clone ${url} .`)

        const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=nirnejak --after=${after} --before=${before} --pretty=format:"%H"`

        let commitHashes = await executeSystemCommand(getCommitsSha)

        if (commitHashes) {
          commitHashes = commitHashes.split('\n')
          let diffsArray = []
          commitHashes.forEach((commitHash, index) => {
            diffsArray.push(executeSystemCommand(`cd temp/${activity._id} && git show ${commitHash}`))
          })
          const commitDiffs = await Promise.all(diffsArray)

          activity.diffs = commitDiffs
          activity.save()
            .then(activity => executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`))
            .then(res => console.log("Activity Stored and Repository Deleted"))
            .catch(err => console.log(chalk.red(err)))
          return Promise.resolve({ ...params, diffs: commitDiffs })
        } else {
          // No commits by the user on selected day on this repository
          await executeSystemCommand(`cd temp/ && rm -rf /${activity._id}`)
          return { ...params, diffs: [] }
        }
      } else {
        activity = Activity({ owner, author, repository, after, before })
        await executeSystemCommand(`mkdir -p temp/${activity._id} && cd temp/${activity._id} && git clone ${url} .`)

        const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=nirnejak --after=${after} --before=${before} --pretty=format:"%H"`

        let commitHashes = await executeSystemCommand(getCommitsSha)

        if (commitHashes) {
          commitHashes = commitHashes.split('\n')
          let diffsArray = []
          commitHashes.forEach((commitHash, index) => {
            diffsArray.push(executeSystemCommand(`cd temp/${activity._id} && git show ${commitHash}`))
          })
          const commitDiffs = await Promise.all(diffsArray)

          activity.diffs = commitDiffs
          activity.save()
            .then(activity => executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`))
            .then(res => console.log("Activity Stored and Repository Deleted"))
            .catch(err => console.log(chalk.red(err)))
          return Promise.resolve({ ...params, diffs: commitDiffs })
        } else {
          // No commits by the user on selected day on this repository
          await executeSystemCommand(`cd temp/ && rm -rf /${activity._id}`)
          return { ...params, diffs: [] }
        }
      }
    })
    .catch(error => {
      console.log(chalk.red(error))
      return Promise.reject(error)
    })
}

if (require.main === module) {
  let data = {
    owner: 'nirnejak',
    author: 'nirnejak',
    repository: 'graphql-app',
    after: '2019-08-16',
    before: '2019-09-17'
  }

  getActivity(data).then(diffs => console.log(diffs))
}

module.exports = getActivity