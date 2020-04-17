const { program  } = require('commander')
const decompress = require('decompress')
const { version } = require('./package.json')

const { success, warn, error } = require('./Logger')

program.version(version)

program
  .command('list <type>')
  .description('list useable resources by type, use types check all types')
  .action(type => {
    getResourcesByType(type).then(resources => {

    })
  })

program
  .command('types')
  .description('list all available types')
  .action(() => {
    getTypes().then(types => {

    })
  })

program
  .command('pull <type> <name> [dest]')
  .description('pull given type given name resource to dest folder or file, defaul dest is current folder')
  .action((type, name, dest = '.') => {
    downloadAndDecompress(type, name, dest)
  })

program.parse(process.argv)

async function downloadAndDecompress(type, name, dest) {
  // TODO: download 
  // const buf = new Buffer()

  try {
    await decompress('test.zip', dest || './')
  } catch (err) {
    error('decompress fail: ', err)
    return
  }

  success('download success')
}

async function getTypes() {
  
}

async function getResourcesByType(type) {

}