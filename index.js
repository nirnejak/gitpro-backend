const express = require('express')
const chalk = require('chalk')
const bodyParser = require('body-parser')

app = express()

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send("Welcome")
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(chalk.green(`Server started at PORT: ${PORT}`))
})