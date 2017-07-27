const ParentStream = require('iframe-stream').ParentStream
const dnode = require('dnode')

module.exports = class RPC {
  constructor (funcs) {
    const d = dnode(funcs)

    d.on('remote', r => {
      this.remote = r
    })

    const parentStream = ParentStream()
    d.pipe(parentStream).pipe(d)
  }

  createChannel () {
    return new Promise((resolve, reject) => {
      this.remote.createChannel(resolve)
    })
  }

  createMessage (data, ports = []) {
    return new Promise((resolve, reject) => {
      this.remote.createMessage(data, ports, resolve)
    })
  }

  createInstance (message) {
    return new Promise((resolve, reject) => {
      this.remote.createInstance(message, resolve)
    })
  }

  bindPort (name, port) {
    return new Promise((resolve, reject) => {
      this.remote.bindPort(name, port, resolve)
    })
  }

  getPort (name) {
    return new Promise((resolve, reject) => {
      this.remote.getPort(name, resolve)
    })
  }

  deletePort (name) {
    return new Promise((resolve, reject) => {
      this.remote.deletePort(name, resolve)
    })
  }

  send (port, message) {
    return new Promise((resolve, reject) => {
      this.remote.send(port, message, resolve)
    })
  }
}
