const { exec }  = require('child_process')
const fs = require('fs')
const path = require('path')
const { success, warn, error } = require('./Logger')

const globalCommandName = 'd'
const execFileName = path.resolve(__dirname, './index.js')
const getGlobalNpmRootcommand = 'npm config list --json'
const cnReg = /(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])/

// 不允许路径中出现中文，中文会导致执行出错
if (cnReg.test(execFileName)) {
  error('current path has chinese part, please move project to an full english path')
  return
}

exec(getGlobalNpmRootcommand, (err, stdout, stderr) => {
  if (err) {
    error(`run command wrong: ${command}`, err)
    return
  }

  let npmPrefixPath = ''
  try {
    const npmConfig = JSON.parse(stdout)
    npmPrefixPath = npmConfig.prefix
  } catch (e) {
    error(`parse data wrong: ${stdout}`, e)
    return
  }

  const commandFilePath = `${npmPrefixPath}/${globalCommandName}.cmd`
  const cmdContent = generateCmdContent(execFileName)

  fs.writeFile(commandFilePath, cmdContent, (err) => {
    if (err) {
      error(`writeFile global command file wrong`, err)
      return
    }

    success('\n', `write global command file success, run ${globalCommandName} test`, '\n')
  })
})

function generateCmdContent(execFileName) {
  
  // %* 表示将命令行参数
  return `node ${execFileName} %*`
}