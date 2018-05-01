import io from 'socket.io-client'
import createClient from './client'
import isAdmin from './is-admin'

/* Wrap client in sockets */

let namespace = isAdmin ? '/admin' : '/clients'
let socket = io(namespace)

function wrapped (opts) {
  opts = isAdmin ? opts.admin : opts

  const { monsterr: client, emitter } = createClient(opts)

  // Inbound
  socket.on('event', event => client.handleEvent(event))
  socket.on('disconnect', () => {
    socket.off()
  })

  // Outbound
  emitter.on('event', event => socket.emit('event', event))
  emitter.on('cmd', cmd => socket.emit('cmd', cmd))

  return client
}

export default wrapped
