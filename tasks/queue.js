const NR = require('node-resque')
const chalk = require('chalk')

async function processQueue() {
  let connectionDetails = {
    pkg: 'ioredis',
    host: '127.0.0.1',
    password: null,
    port: 6379,
    database: 0
  }

  const jobs = {
    'subtract': {
      perform: (a, b) => {
        let answer = a - b
        return answer
      }
    },
    fetchData: function (arg_data, callback) {
      console.log(chalk.yellow.inverse(arg_data))
      let data = {
        name: "Jitendra Nirnejak",
        login: "nirnejak"
      }
      console.log(chalk.red(arg_data))
      callback(err, data)
    }
  }

  const queue = new NR.Queue({ connection: connectionDetails }, jobs)

  queue.on('error', (error) => console.log(chalk.red(error)))

  await queue.connect(() => {
    // queue.enqueue('math', 'add', [1, 2]);
    // queue.enqueue(3000, 'math', 'add', [2, 1]);
    // Can also be called outside, or using await
    console.log("Queue Connected")
    queue.enqueue('fetchDataQueue', "fetchData", "Jitendra Nirnejak", (err, data) => {
      console.log(chalk.red(err))
      console.log(chalk.blue(data))
    })

    const worker = new NR.Worker({ connection: connectionDetails, queues: ['emailQueue'] }, jobs)

    worker.connect(() => {
      worker.workerCleanup()
      worker.start()
    })

    worker.on('error', (queue, job, error) => console.log(chalk.red(error)))
  })
  console.log(queue)
}

module.exports = processQueue