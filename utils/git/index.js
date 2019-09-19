const exec = require('child_process').exec;
const chalk = require('chalk')
const redis = require('redis')

const config = require('../../config')

const client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST)

// Wrapper of the exec function with Promise
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
  const { owner, author, repository, after, before } = params

  const getCommitsSha = `cd temp/${owner}/${repository} && git log --all --no-merges --author=${author} --after=${after} --before=${before} --pretty=format:"%H"`
  let commitHashes = await executeSystemCommand(getCommitsSha)

  if (!commitHashes) {
    // No commits by the user on selected day on this repository
    return []
  } else {
    commitHashes = commitHashes.split('\n')
    let diffsArray = []
    commitHashes.forEach((commitHash, index) => {
      diffsArray.push(executeSystemCommand(`cd temp/${owner}/${repository} && git show ${commitHash}`))
    })

    const commitDiffs = await Promise.all(diffsArray)
    console.log(commitDiffs)
    // TODO: Store to MongoDB instead of Redis
    client.set(`${owner}:${repository}:${author}`, JSON.stringify(commitDiffs))
    return commitDiffs
  }
}

function getDiffs(params) {
  const { owner, author, repository, after, before, token } = params

  const url = `https://${owner}:${token}@github.com/${owner}/${repository}.git`

  return executeSystemCommand(`mkdir -p temp/${owner} && cd temp/${owner} && git clone ${url} || true`)
    .then(res => processRepository(params))
    .catch((error) => {
      if (error.message.includes('File exists')) {
        return executeSystemCommand(`rm -rf temp/${owner}`)
          .then(res => {
            executeSystemCommand(`mkdir -p temp/${owner} && cd temp/${owner} && git clone ${url} || true`)
              .then(res => {
                return processRepository(params)
              })
              .catch(error => {
                console.log(chalk.red(error))
                return error
              })
          })
          .catch(error => {
            console.log(chalk.red(error))
            return error
          })
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
    repository: 'graphql-app',
    after: '2019-08-16',
    before: '2019-09-17'
  }

  getDiffs(data).then(diffs => console.log(diffs))
}

module.exports = getDiffs