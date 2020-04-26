const exec = require('child_process').exec;

// Wrapper of the exec function with Promise
module.exports = executeSystemCommand = command => {
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