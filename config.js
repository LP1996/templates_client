const host = 'http://localhost:8170'

const config ={
  BACKEND_URLS: {
    GET_TYPE: host + '/type/list',
    GET_RESOURCE: host + '/resource/list',
    DOWN_RESOURCE: host + '/resource/down'
  }
}

module.exports = config