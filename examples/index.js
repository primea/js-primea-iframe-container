const IPFS = require('ipfs')
const Hypervisor = require('primea-hypervisor')
const IframeContainer = require('../')
const Message = require('primea-message')
const fs = require('fs')

const content = fs.readFileSync(__dirname + '/content.bundle.js')

const node = new IPFS({
  start: false
})

// wait untill the ipfs node is ready
node.on('ready', () => {
  // create a new hypervisor instance
  const hypervisor = new Hypervisor(node.dag)
  hypervisor.registerContainer('iframe', IframeContainer)

  // create a root instance of the example container
  hypervisor.createInstance('iframe', new Message({data: content}))

  // // create two channels
  // const [portRef1, portRef2] = root.ports.createChannel()
  // const [portRef3, portRef4] = root.ports.createChannel()

  // // create two instances of the example container. These containers wiil be
  // // given channels to the parent container
  // root.createInstance('example', root.createMessage({
  //   ports: [portRef2]
  // }))

  // root.createInstance('example', root.createMessage({
  //   ports: [portRef4]
  // }))

  // // bind the ports of the channels to the newly created containers. Binding
  // // ports allows the root container tt receieve messages from the containers.
  // // If no other container bound these ports then the corrisponding containers
  // // would be garbage collected
  // root.ports.bind('one', portRef1)
  // root.ports.bind('two', portRef3)

  // // create a new channel. Each channel has two corrisponding ports that
  // // containers can communicate over
  // const [chanRef1, chanRef2] = root.ports.createChannel()

  // // send the newly created ports to each of the containers. Once both the
  // // recieving containers bind the ports they will be able to communicate
  // // directly with each other over them
  // await root.send(portRef1, root.createMessage({
  //   data: 'bindPort',
  //   ports: [chanRef1]
  // }))

  // await root.send(portRef3, root.createMessage({
  //   data: 'bindPort',
  //   ports: [chanRef2]
  // }))

  // // after the recieving containers bind the ports in the messages the channel
  // // topology will look like this. Where "[]" are the containers, "*" are the
  // // ports that the container have and "(name)" is the port name.
  // //
  // //        root container
  // //            [ ]
  // //      (one) * * (two)
  // //           /    \
  // //          /      \
  // //         /        \
  // // (parent)*          * (parent)
  // //       [ ]*--------*[ ]
  // //     (channel)    (channel)

  // // create a new state root. The state root is not created untill the
  // // hypervisor has finished all of it's work
  // const stateRoot = await hypervisor.createStateRoot()
  // console.log(stateRoot)
  // console.log('--------full state dump---------')
  // await hypervisor.graph.tree(stateRoot, Infinity)
  // console.log(JSON.stringify(stateRoot, null, 2))
})
