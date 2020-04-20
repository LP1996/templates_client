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
  .description('pull given type given name resource to dest folder or file, defaul dest is current folder')
  .action((type, name, dest = '.') => {
    downloadAndDecompress(type, name, dest)
  })

program.parse(process.argv)

function downloadAndDecompress(type, name, dest) {
  downResource(type, name).then(async file => {
    console.log(file)
    if (typeof file === 'string') {
      error('download file fail')
      return
    }

    try {
      await decompress(file, dest || './')
    } catch (err) {
      error('decompress fail: ', err)
      return
    }

    success('download success')
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