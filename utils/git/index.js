const exec = require('child_process').exec;
const chalk = require('chalk')
const redis = require('redis')

const config = require('../../config')

const client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST)

let diffs = []
let processed = 0
let total_commits = 0

const saveData = (owner, repoName, author) => {
  if (processed === total_commits) {
    console.log(chalk.yellow("💾  Saving to Redis"))
    client.rpush([`${owner}:${repoName}:${author}x`, ...diffs], (err, reply) => console.log(reply))
  }
}


const processRepository = (params) => {
  const { owner, author, repoName, after, before } = params

  const getCommitsSha = `cd temp/${owner}/${repoName} && git log --all --no-merges --author=${author} --after=${after} --before=${before} --pretty=format:"%H"`

  exec(getCommitsSha, (error, stdout, stderr) => {
    if (error) console.log(chalk.red(error))

    let repoSHAs = stdout.split('\n')
    if (repoSHAs.length > 0) {
      total_commits = repoSHAs.length

      repoSHAs.forEach(repoSHA => {
        exec(`cd temp/${owner}/${repoName} && git show ${repoSHA}`, (error, stdout, stderr) => {
          if (error) console.log(chalk.red(error))

          processed += 1
          diffs.push(stdout)
          saveData(owner, repoName, author)
        })
      })
    }
  })
}

function getDiffs(params) {
  const { owner, author, repoName, after, before } = params

  const url = `https://github.com/${owner}/${repoName}`

  exec(`mkdir temp/${owner} && cd temp/${owner} && git clone ${url}`, (error, stdout, stderr) => {
    if (error) {
      if (error.message.includes('File exists')) {
        exec(`rm -rf temp/${owner} && mkdir temp/${owner} && cd temp/${owner} && git clone ${url}`, (error, stdout, stderr) => {
          if (error) console.log(chalk.red(error))

          processRepository(params)
        })
      } else {
        console.log(chalk.red(error))
      }
    } else {
      processRepository(params)
    }
  })
}

if (require.main === module) {
  getDiffs({
    owner: 'nirnejak',
    author: 'nirnejak',
    repoName: 'graphql-app',
    after: '2019-08-16',
    before: '2019-09-17'
  })
}

module.exports = getDiffs