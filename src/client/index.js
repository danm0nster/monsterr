import io from 'socket.io-client'
import createClient from './client'
import isAdmin from './is-admin'

/* Wrap client in sockets */

let namespace = isAdmin ? '/admin' : '/clients'
let socket = io(namespace)

function wrapped (opts) {
  opts = !isAdmin ? opts : Object.assign(opts, { adminClient: true })

  const { monsterr: client, emitter } = createClient(opts)

  // Inbound
  socket.on('_id', uuid => client.setId(uuid))
  socket.on('_heartbeat', ({ latest, avg }) => {
    console.log('heartbeat received', 'latest:', latest, 'avg:', avg)
    socket.emit('_heartbeat_ack')
  })
  socket.on('event', event => client.handleEvent(event))
  socket.on('disconnect', () => {
    socket.off()
    client.disconnect()
  })

  // Outbound
  emitter.on('event', event => socket.emit('event', event))
  emitter.on('cmd', cmd => socket.emit('cmd', cmd))

  return client
}

export default wrapped
