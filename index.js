const express = require('express')
const chalk = require('chalk')

app = express()

app.get('/', (req, res) => {
  res.send("Welcome")
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(chalk.green(`Server started at PORT: ${PORT}`))
})