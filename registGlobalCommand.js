const { exec }  = require('child_process')
const fs = require('fs')
const path = require('path')
const { success, warn, error } = require('./Logger')

const globalCommandName = 'd'
const execFileName = path.resolve(__dirname, './index.js')
const command = 'npm config list --json'

exec('npm config list --json', (err, stdout, stderr) => {
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

  try {

    // 文件可访问则表示文件存在，不许要再次注册
    fs.accessSync(commandFilePath)
    warn('\n', 'global command has been registed', '\n')
    return
  } catch (e) {}

  fs.writeFile(commandFilePath, generateCmdContent(execFileName), (err) => {
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