const RPC = require('../rpc.js')

const rpc = new RPC({
  onCreation: async (message, cb) => {
    await rpc.bindPort('parent', message.ports[0])
    cb()
  },
  onMessage: async (message, cb) => {
    if (message.data === 'bindPort') {
      await Promise.all([
        rpc.bindPort('channel', message.ports[0]),
        rpc.createMessage('hello world!').then(msg => rpc.send(message.ports[0], msg))
      ])
    } else {
      console.log('got meessage!', message.data)
    }
    cb()
  }
})
