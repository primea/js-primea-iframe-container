const ReferenceMap = require('reference-map')
const createIframe = require('create-iframe')
const IframeStream = require('iframe-stream').IframeStream
const dnode = require('dnode')

module.exports = class IframeContainer {
  constructor (kernel) {
    this.kernel = kernel
    this._iframeInit = false
    this._refs = new ReferenceMap()
  }

  _setUpIframe () {
    if (!this._iframeInit) {
      const code = this.kernel.state.code
      if (code) {
        let res
        const self = this
        const promise = new Promise((resolve, reject) => {
          res = resolve
        })

        this.iframe = createIframe(code, {
          container: document.body,
          sandbox: ['allow-scripts', 'allow-same-origin']
        }).iframe

        this.iframeStream = IframeStream(this.iframe)

        const d = dnode(function (remote) {
          self.remote = remote
          this.getPort = (name, cb) => {
            const port = self.kernel.ports.get(name)
            cb(self._refs.add(port))
          }
          this.bindPort = async (name, port, cb) => {
            port = self._refs.get(port)
            await self.kernel.ports.bind(name, port)
            cb()
          }
          this.deletePort = (name, cb) => {
            self.kernel.ports.delete(name)
            cb()
          }
          this.createInstance = async (message, cb) => {
            message = self._refs.get(message.msgRef)
            await self.kernel.createInstance(IframeContainer.type, message)
            cb()
          }
          this.createMessage = (data, ports, cb) => {
            const message = self.kernel.createMessage({
              data: data,
              ports: ports.map(ref => self._refs.get(ref))
            })

            const json = Object.assign({}, message.toJSON())
            json.msgRef = self._refs.add(message)
            json.ports = message.ports.map(port => self._refs.add(port))

            cb(json)
          }
          this.createChannel = cb => {
            const ports = self.kernel.ports.createChannel()
            const port1 = self._refs.add(ports[0])
            const port2 = self._refs.add(ports[1])
            cb([port1, port2])
          }
          this.send = async (port, message, cb) => {
            port = self._refs.get(port)
            message = self._refs.get(message.msgRef)
            await self.kernel.send(port, message)
            cb()
          }
          this.id = cb => {
            cb(self.kernel.id)
          }
          self._iframeInit = true
          d.on('remote', res)
        })
        d.pipe(this.iframeStream).pipe(d)
        return promise
      }
    }
  }

  async initialize (message) {
    this.kernel.state.code = message.data
    delete message._opts.data
    return this.run(message, 'initialize')
  }

  // the function is called for each message that a container gets
  async run (message, method = 'main') {
    await this._setUpIframe()
    const json = Object.assign({}, message.toJSON())
    json.msgRef = this._refs.add(message)
    json.ports = message.ports.map(port => this._refs.add(port))

    return new Promise((resolve, reject) => {
      this.remote[method](json, resolve)
    })
  }

  onIdle () {}
}
