const chalk = require('chalk')

const log = console.log

const logger = {
  success(...str) {
    log(chalk.bold.green(...str))
  },
  warn(...str) {
    log(chalk.bold.keyword('orange')(...str))
  },
  error(...str) {
    log(chalk.bold.red(...str))
  }
}

module.exports = logger