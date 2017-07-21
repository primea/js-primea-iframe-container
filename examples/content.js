const ParentStream = require('iframe-stream').ParentStream
const dnode = require('dnode')

const parentStream = ParentStream()

const d = dnode({
  init: (message, cb) => {
    console.log('init')
    cb()
  },
  onMessage: (message, cb) => {
    console.log('message')
    cb()
  }
})

d.on('remote', r => {
  this.remote = r
})

parentStream.pipe(d).pipe(parentStream)
