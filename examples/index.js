const IPFS = require('ipfs')
const Hypervisor = require('primea-hypervisor')
const IframeContainer = require('../')
const Message = require('primea-message')
const fs = require('fs')

const content = fs.readFileSync(__dirname + '/rootContainer.bundle.js').toString()

const node = new IPFS({
  start: false
})

// wait untill the ipfs node is ready
node.on('ready', async () => {
  // create a new hypervisor instance
  const hypervisor = new Hypervisor(node.dag)
  hypervisor.registerContainer('iframe', IframeContainer)

  // create a root instance of the example container
  const root = await hypervisor.createInstance('iframe', new Message({
    data: content
  }))

  window.state = hypervisor.state
  console.log(hypervisor.state)
  const stateRoot = await hypervisor.createStateRoot(0)
  console.log('create state')
  console.log(stateRoot)
  console.log('--------full state dump---------')
  await hypervisor.graph.tree(stateRoot, Infinity)
  // console.log(JSON.stringify(stateRoot, null, 2))
})
