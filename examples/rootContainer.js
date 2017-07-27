const fs = require('fs')
const RPC = require('../rpc.js')

const childcontent = fs.readFileSync(__dirname + '/childContainer.bundle.js').toString()

const rpc = new RPC({
  initialize: async function (message, cb) {
    const channelCreationPromise = rpc.createChannel().then(([chanRef1, chanRef2]) => {
      return Promise.all([
        rpc.createMessage('bindPort', [chanRef1]).then(msg => rpc.send(portRef1, msg)),
        rpc.createMessage('bindPort', [chanRef2]).then(msg => rpc.send(portRef3, msg))
      ])
    })

    const [[portRef1, portRef2], [portRef3, portRef4]] = await Promise.all([
      rpc.createChannel(),
      rpc.createChannel()
    ])

    await Promise.all([
      channelCreationPromise,
      rpc.createMessage(childcontent, [portRef2]).then(msg => rpc.createInstance(msg)),
      rpc.createMessage(childcontent, [portRef4]).then(msg => rpc.createInstance(msg)),
      rpc.bindPort('child0', portRef1),
      rpc.bindPort('child1', portRef3)
    ])

    console.log('done!!!!')
    cb()
  },
  onMessage: (message, cb) => {
    cb()
  }
})
