const createIframe = require('create-iframe')
const IframeStream = require('iframe-stream').IframeStream
const dnode = require('dnode')

module.exports = class IframeContainer {
  // the constructor is given an instance of the kernel
  // https://github.com/primea/js-primea-hypervisor/blob/master/docs/kernel.md
  constructor (kernel) {
    this.kernel = kernel
    this._setUpIframe()
  }

  _setUpIframe () {
    const code = this.kernel.state.code
    if (code) {
      this.iframe = createIframe(this.kernel.state.code, {
        container: document.body,
        sandbox: ['allow-scripts', 'allow-same-origin']
      }).iframe

      this.iframeStream = IframeStream(this.iframe)
      const d = dnode({
        getPort: (name, cb) => {
          cb(this.ports.get(name))
        },
        storePort: (name, port, cb) => {
          this.ports.set(name, port)
          cb()
        },
        deletePort: (name, cb) => {
          this.ports.delete(name)
          cb()
        },
        createInstance: async (message, cb) => {
          await this.create(IframeContainer.name, message)
          cb()
        },
        createMessage: (data, ports, cb) => {
          const message = this.createMessage({
            data: data,
            ports: ports
          })
          cb(message)
        },
        createChannel: cb => {
          cb(this.createChannel())
        },
        send: (port, message, cb) => {
          this.send(port, message)
          cb()
        },
        id: cb => {
          cb(this.id)
        }
      })
      this.iframeStream.pipe(d).pipe(this.iframeStream)

      return Promise((resolve, reject) => {
        d.on('remote', remote => {
          this.remote = remote
          resolve()
        })
      })
    }
  }

  // this method runs once when the container is intailly created. It is given
  // a message with a single port, which is a channel to its parent with the
  // exception of the root container (the container that is intailial created)
  initialize (message) {
    this.kernel.state.code = message.data
    this._setUpIframe()
    this.run(message, 'initialize')
  }

  // the function is called for each message that a container gets
  async run (message, method = 'main') {
    this.remote[method](message)
  }

  onIdle () {}
}
