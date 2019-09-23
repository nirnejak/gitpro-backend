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

        // const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=${author} --after=${after} --before=${before} --pretty=format:"%H"`
        const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=nirnejak --after=${after} --before=${before} --pretty="oneline"`

        let commits = await executeSystemCommand(getCommitsSha)

        if (commits) {
          commits = commits.split('\n')
          commits = commits.map(commit => {
            commit = commit.split(" ")
            let hash = commit.shift()
            let commitMessage = commit.join(" ")
            return { hash, commitMessage }
          })
          let diffsPromiseArray = []
          commits.forEach(commit => {
            diffsPromiseArray.push(executeSystemCommand(`cd temp/${activity._id} && git show ${commit.hash}`))
          })
          const commitDiffs = await Promise.all(diffsPromiseArray)
          for (let i = 0; i < commits.length; i++) commits[i].diff = commitDiffs[i]

          activity.contributions = commits
          activity.save()
            .then(activity => executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`))
            .then(res => console.log("Activity Stored and Repository Deleted"))
            .catch(err => console.log(chalk.red(err)))
          return Promise.resolve({ ...params, contributions: commits })
        } else {
          // No commits by the user on selected day on this repository
          const res = await executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`)
          return { ...params, contributions: [] }
        }
      } else {
        activity = Activity({ owner, author, repository, after, before })
        await executeSystemCommand(`mkdir -p temp/${activity._id} && cd temp/${activity._id} && git clone ${url} .`)

        // const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=nirnejak --after=${after} --before=${before} --pretty=format:"%H"`
        const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=nirnejak --after=${after} --before=${before} --pretty="oneline"`

        let commits = await executeSystemCommand(getCommitsSha)

        if (commits) {
          commits = commits.split('\n')
          let diffsPromiseArray = []
          commits.forEach(commit => {
            diffsPromiseArray.push(executeSystemCommand(`cd temp/${activity._id} && git show ${commit.hash}`))
          })
          const commitDiffs = await Promise.all(diffsPromiseArray)
          for (let i = 0; i < commits.length; i++) commits[i].diff = commitDiffs[i]

          activity.contributions = commits
          activity.save()
            .then(activity => executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`))
            .then(res => console.log("Activity Stored and Repository Deleted"))
            .catch(err => console.log(chalk.red(err)))
          return Promise.resolve({ ...params, contributions: commits })
        } else {
          // No commits by the user on selected day on this repository
          const res = await executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`)
          return { ...params, contributions: [] }
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