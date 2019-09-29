const chalk = require('chalk')

const Activity = require('../models/activity')

const executeSystemCommand = require('./exec')

async function getActivity(params) {
  const { user, owner, author, repository, after, before, token } = params
  const cloneUrl = `https://${user}:${token}@github.com/${owner}/${repository}.git`

  try {
    let activity = await Activity.findOne({ owner, author, repository, after, before })
    if (!activity) {
      activity = Activity({ owner, author, repository, after, before })
    }

    await executeSystemCommand(`mkdir -p temp/${activity._id} && cd temp/${activity._id} && git clone ${cloneUrl} .`)
    // const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=${author} --after=${after} --before=${before} --pretty=format:"%H |%m| %B |%m| %ad"`
    const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=${author.toLowerCase()} --after=${after} --before=${before} --pretty="oneline"`

    let commits = await executeSystemCommand(getCommitsSha)
    if (commits) {
      commits = commits.split('\n')
      commits = commits.map(commit => {
        commit = commit.split(" ")
        let hash = commit.shift()
        let commitMessage = commit.join(" ")
        return { hash, commitMessage }
      })

      let commitDiffsPromiseArray = []
      commits.forEach(commit => {
        if (commit.hash.length)
          commitDiffsPromiseArray.push(executeSystemCommand(`cd temp/${activity._id} && git show ${commit.hash}`))
      })
      const commitDiffs = await Promise.all(commitDiffsPromiseArray)
      for (let i = 0; i < commits.length; i++) commits[i].diff = commitDiffs[i]
      commits = commits.filter(commit => commit.hash.length)

      let commitInfoPromiseArray = []
      commits.forEach(commit => {
        commitInfoPromiseArray.push(executeSystemCommand(`cd temp/${activity._id} && git name-rev --name-only ${commit.hash}`))
      })
      let commitBranchNames = await Promise.all(commitInfoPromiseArray)
      commitBranchNames = commitBranchNames.map(branchName => branchName.split('\n')[0])
      for (let i = 0; i < commits.length; i++) commits[i].branch = commitBranchNames[i]

      activity.contributions = commits
      activity.save()
        .then(activity => executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`))
        .then(res => console.log("Activity Stored and Repository Deleted"))
        .catch(err => console.log(chalk.red(err)))

      return Promise.resolve({ owner, author, repository, after, before, contributions: commits })
    } else {
      // No commits by the user on selected day on this repository
      const res = await executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`)
      return { owner, author, repository, after, before, contributions: [] }
    }
  } catch (error) {
    console.log(chalk.red(error))
    return Promise.reject(error)
  }
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