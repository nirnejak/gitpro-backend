const exec = require('child_process').exec;
const chalk = require('chalk')
const redis = require('redis')

const config = require('../../config')

const client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST)

// Wrapper of the exec function with Promises
function executeSystemCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      } else {
        return resolve(stdout)
      }
    })
  })
}


async function processRepository(params) {
  const { owner, author, repoName, after, before } = params

  const getCommitsSha = `cd temp/${owner}/${repoName} && git log --all --no-merges --author=${author} --after=${after} --before=${before} --pretty=format:"%H"`

  let commitHashes = await executeSystemCommand(getCommitsSha)
  commitHashes = commitHashes.split('\n')

  if (commitHashes.length === 0) {
    // No commits by the user on selected day
    return []
  } else {
    let diffsArray = []
    commitHashes.forEach((commitHash, index) => {
      diffsArray.push(executeSystemCommand(`cd temp/${owner}/${repoName} && git show ${commitHash}`))
    })

    const commitDiffs = await Promise.all(diffsArray)
    /* TODO: Store to MongoDB instead of Redis
      With these fields
      owner
      repo
      author
      date
      diffs
      */
    client.set(`${owner}:${repoName}:${author}`, JSON.stringify(commitDiffs))
    return commitDiffs
  }
}

function getDiffs(params) {
  const { owner, author, repoName, after, before } = params

  const url = `https://github.com/${owner}/${repoName}`

  executeSystemCommand(`mkdir temp/${owner} && cd temp/${owner} && git clone ${url}`)
    .then(res => processRepository(params))
    .catch(async (error) => {
      if (error.message.includes('File exists')) {
        const res = await executeSystemCommand(`rm -rf temp/${owner} && mkdir temp/${owner} && cd temp/${owner} && git clone ${url}`)
        return processRepository(params)
      } else {
        console.log(chalk.red(error))
        return error
      }
    })
}

if (require.main === module) {
  let data = {
    owner: 'nirnejak',
    author: 'nirnejak',
    repoName: 'graphql-app',
    after: '2019-08-16',
    before: '2019-09-17'
  }

  console.log(getDiffs(data))
}

module.exports = getDiffs