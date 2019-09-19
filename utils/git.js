const chalk = require('chalk')

const Activity = require('../models/activity')

const executeSystemCommand = require('./exec')


async function processRepository(params) {
  const { owner, author, repository, after, before } = params

  const getCommitsSha = `cd temp/${owner}/${repository} && git log --all --no-merges --author=${author} --after=${after} --before=${before} --pretty=format:"%H"`
  let commitHashes = await executeSystemCommand(getCommitsSha)

  if (!commitHashes) {
    // No commits by the user on selected day on this repository
    return executeSystemCommand(`cd temp/${owner} && rm -rf /${repository}`)
      .then(res => ({ ...params, diffs: [] }))
      .catch(err => Promise.reject(err))
  } else {
    commitHashes = commitHashes.split('\n')
    let diffsArray = []
    commitHashes.forEach((commitHash, index) => {
      diffsArray.push(executeSystemCommand(`cd temp/${owner}/${repository} && git show ${commitHash}`))
    })

    const commitDiffs = await Promise.all(diffsArray)

    let activityData = { ...params, diffs: commitDiffs }
    let activity = Activity(activityData)
    activity.save()
      .then(activity => executeSystemCommand(`cd temp/${owner} && rm -rf /${repository}`))
      .then(res => console.log("Activity Stored and Repository Deleted"))
      .catch(err => console.log(chalk.red(err)))
    return Promise.resolve(activityData)
  }
}

function getDiffs(params) {
  const { owner, author, repository, after, before, token } = params

  const url = `https://${owner}:${token}@github.com/${owner}/${repository}.git`

  return executeSystemCommand(`mkdir -p temp/${owner} && cd temp/${owner} && git clone ${url}`)
    .then(res => processRepository(params))
    .catch((error) => {
      if (error.message.includes('File exists') || error.message.includes('already exists and is not an empty directory.')) {
        return executeSystemCommand(`rm -rf temp/${owner}`)
          .then(res => executeSystemCommand(`mkdir -p temp/${owner} && cd temp/${owner} && git clone ${url}`))
          .then(res => processRepository(params))
          .catch(error => Promise.reject(error))
      } else {
        return Promise.reject(error)
      }
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

  getDiffs(data).then(diffs => console.log(diffs))
}

module.exports = getDiffs