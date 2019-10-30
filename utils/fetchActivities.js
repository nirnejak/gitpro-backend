const chalk = require('chalk')
const fs = require('fs')

const Activity = require('../models/activity')

const executeSystemCommand = require('./exec')

async function getActivity(params) {
  const { user, owner, author, repository, after, before, token, tz } = params
  const cloneUrl = `https://${user}:${token}@github.com/${owner}/${repository}.git`

  try {
    let activity = await Activity.findOne({ owner, author, repository, after, before })
    if (!activity) {
      activity = Activity({ owner, author, repository, after, before })
    }

    await executeSystemCommand(`mkdir -p temp/${activity._id} && cd temp/${activity._id} && git clone ${cloneUrl} .`)
    // const getCommitsSha = `cd temp/${activity._id} && git log --all --no-merges --author=${author} --after=${after} --before=${before} --pretty=format:"%H |%m| %B |%m| %ad"`
    const getCommitsSha = `cd temp/${activity._id} && TZ=${tz} git log --all --no-merges --author=${author.includes(" ") ? '"' + author + '"' : author.toLowerCase()} --after=${after} --before=${before} --pretty="oneline"`

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
          commitDiffsPromiseArray.push(executeSystemCommand(`cd temp/${activity._id} && git show ${commit.hash} > ${commit.hash}.txt`))
      })
      await Promise.all(commitDiffsPromiseArray)

      let commitDiffs = []
      commits.forEach(commit => {
        if (commit.hash.length) {
          const stats = fs.statSync(`temp/${activity._id}/${commit.hash}.txt`)
          if (stats["size"] / 1024 > 512) {
            commitDiffs.push("Error:Diff is too large")
          } else {
            commitDiffs.push(fs.readFileSync(`temp/${activity._id}/${commit.hash}.txt`))
          }
        }
      })

      for (let i = 0; i < commits.length; i++) commits[i].diff = commitDiffs[i]
      commits = commits.filter(commit => commit.hash.length)

      let commitInfoPromiseArray = []
      commits.forEach(commit => {
        commitInfoPromiseArray.push(executeSystemCommand(`cd temp/${activity._id} && git name-rev --name-only ${commit.hash}`))
      })
      let commitBranchNames = await Promise.all(commitInfoPromiseArray)
      commitBranchNames = commitBranchNames.map(branchName => branchName.split('\n')[0].replace('remotes/origin/', ''))
      for (let i = 0; i < commits.length; i++) commits[i].branch = commitBranchNames[i]

      activity.contributions = commits
      activity.save()
        .then(activity => executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`))
        .then(res => console.log("Activity Stored and Repository Deleted"))
        .catch(err => console.log(chalk.red(err)))

      return Promise.resolve(activity)
    } else {
      // No commits by the user on selected day on this repository

      // INFO: Try with %aN instead of $an
      let contributors = await executeSystemCommand(`cd temp/${activity._id} && git log --all --no-merges --after=${after} --before=${before} --pretty="format:%aN"`)

      let unique_contributors = []
      if (contributors) {
        contributors = contributors.split('\n')
        contributors.forEach(contributor => {
          if (!unique_contributors.includes(contributor)) {
            unique_contributors.push(contributor)
          }
        })
      }

      const res = await executeSystemCommand(`cd temp/ && rm -rf ${activity._id}/`)
      return { owner, author, repository, after, before, contributions: [], contributors: unique_contributors }
    }
  } catch (error) {
    console.log(chalk.red(error))
    return Promise.reject(error)
  }
}

module.exports = getActivity