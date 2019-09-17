const Git = require("nodegit")
const chalk = require("chalk")

const owner = 'nirnejak'
const repo = 'blog-app'

// Git.Clone(`https://github.com/${owner}/${repo}`, `temp/${owner}/${repo}`)
//   .then(repository => repository.getBranchCommit("master"))
//   .then(commit => commit.message())
//   .then(message => console.log(chalk.yellow.inverse(message)))
//   .catch(err => chalk.red.inverse(err))

Git.Repository.open(`temp/${owner}/${repo}`)
  .then(repo => repo.getMasterCommit())
  .then(firstCommitOnMaster => {
    let history = firstCommitOnMaster.history()
    let count = 0

    history.on("commit", (commit) => {
      if (++count >= 9) {
        return
      }

      console.log("commit " + commit.sha())

      let author = commit.author();

      console.log(`Author: \t ${author.name()} <${author.email()}>`);
      console.log(`Date: \t\t ${commit.date()}`)
      console.log(`\n ${commit.message()}`)
    })
    history.start();
  })