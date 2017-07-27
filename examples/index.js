const IPFS = require('ipfs')
const Hypervisor = require('primea-hypervisor')
const IframeContainer = require('../')
const Message = require('primea-message')
const fs = require('fs')

// load the content of the iframe
const content = fs.readFileSync(__dirname + '/rootContainer.bundle.js').toString()

const node = new IPFS({
  start: false
})

// wait untill the ipfs node is ready
node.on('ready', async () => {
  const sr = JSON.parse(localStorage.getItem('sr'))
  const hypervisor = new Hypervisor(node.dag, sr || {})
  hypervisor.registerContainer('iframe', IframeContainer)

  if (!sr) {
    await hypervisor.createInstance('iframe', new Message({
      data: content
    }))
  } else {
    await hypervisor.getInstance(hypervisor.ROOT_ID)
  }

  const stateRoot = await hypervisor.createStateRoot(0)
  console.log('create state', stateRoot)
  localStorage.setItem('sr', JSON.stringify(stateRoot))
  console.log('--------full state dump---------')
  await hypervisor.graph.tree(stateRoot, Infinity)
  console.log(stateRoot)
})
