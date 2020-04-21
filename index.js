const { execSync } = require('child_process')
const { program  } = require('commander')
const decompress = require('decompress')
const { version } = require('./package.json')

const { success, warn, error } = require('./Logger')
const { getTypes, getResources, downResource }  = require('./api')

program.version(version)

program
  .command('list <type>')
  .description('list useable resources by type, use types check all types')
  .action(type => {
    getResources(type).then(res => {
      msg(res.data)
    }).catch(() => error(`get resources in ${type} fail`))
  })

program
  .command('types')
  .description('list all available types')
  .action(() => {
    getTypes().then(res => {
      msg(res.data)
    }).catch(() => error(`get types fail`))
  })

program
  .command('pull <type> <name> [dest]')
  .description('pull given type given name resource to dest folder or file, default dest is current folder. decompress will cover same name file')
  .action((type, name, dest = './') => {
    downloadAndDecompress(type, name, dest)
  })

program.parse(process.argv)

function downloadAndDecompress(type, name, dest) {
  downResource(type, name).then(async file => {
    try {
      JSON.parse(file)
      error('download file fail')
      return
    } catch (err) {}

    try {
      let files = await decompress(file)
      const firstDirName = files[0].type === 'dictionary' ? files[0].path : ''
      const hasTopDir = firstDirName && files.every(file => file.path.startsWith(firstDirName))
      const package = files.find(file => file.path.includes('package.json'))

      if (package) {
        const trimHeadNonNumberReg = /^[^\d]*/
        const packageJson = JSON.parse(package.data.toString())
        
        try {

          // 只有在有 package.json 文件，并且有 cli 依赖时才做检查
          if (packageJson.devDependencies['@vue/cli-service']) {
            const downCliVersion = packageJson.devDependencies['@vue/cli-service'].replace(trimHeadNonNumberReg, '')
            const buf = execSync('vue -V')
            const localCliVersion = buf.toString().replace(trimHeadNonNumberReg, '')
  
            // cli 主版本不一致
            if (downCliVersion.split('.')[0] !== localCliVersion.split('.')[0]) {
              warn(`your local vue-cli version is ${localCliVersion}, but download resource need vue-cli version ${downCliVersion}, refuse operate`)
              return
            }
          }
        } catch (err) {
          // 捕获到错误说明是执行命令出错，跳过 cli version 比较
        }
      }

      files = null

      decompress(file, dest, { strip: hasTopDir ? 1 : 0 })
    } catch (err) {
      error('decompress fail: ', err)
      return
    }

    success('download and decompress success')
  })
}

function msg(arr) {
  let msg = ''

  for (let i = 0; i < arr.length; i++) {
    const firstline = `${i + 1}.${arr[i].name}\n`
    const secondline = `  ${arr[i].description}\n`
    msg += (firstline + secondline)
  }

  console.log(msg)
}