const { request } = require('http')
const config = require('./config')

function getRequest(url, params) {
  return new Promise((resolve, reject) => {
    const req = request(qs(url, params), res => {
      let loaded

      res.on('data', chunk => {
        loaded ? loaded += chunk : loaded = chunk
      })

      res.on('end', () => {
        res = null
        resolve(loaded.toString())
      })
    })
    req.on('error', err => {
      reject(err)
    })
    req.end()
  })
}

function downRequest(url, params) {
  return new Promise((resolve, reject) => {
    const req = request(qs(url, params), res => {
      let loaded = Buffer.alloc(0)

      res.on('data', chunk => {
        loaded = Buffer.concat([loaded, chunk])
      })

      res.on('end', () => {
        res = null
        resolve(loaded)
      })
    })
    req.on('error', err => {
      reject(err)
    })
    req.end()
  })
}

const qsExcludes = ['undefined', 'function']
function qs(url, params) {
  if (!params) {
    return url
  }

  const entries = Object.entries(params)
  
  if (!entries.length) {
    return url
  }

  const query = entries.filter(([, value]) => !qsExcludes.includes(typeof value))
    .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join('&')
  
  return url.includes('?') ? `${url}&${query}` : `${url}?${query}`
}

const APIS = {
  getTypes() {
    return getRequest(config.BACKEND_URLS.GET_TYPE).then(translateRes)
  },
  getResources(type) {
    return getRequest(config.BACKEND_URLS.GET_RESOURCE, { type }).then(translateRes)
  },
  downResource(type, name) {
    return downRequest(config.BACKEND_URLS.DOWN_RESOURCE, { type, name })
  }
}

function translateRes(res) {
  return JSON.parse(res)
}

module.exports = APIS