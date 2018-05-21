import { EventEmitter } from 'events'
import io from 'socket.io-client'

class SocketClient extends EventEmitter {
  constructor (namespace) {
    super()

    this.socket = io(namespace)
    this.setupHandlers()
  }

  setupHandlers () {
    this.socket.on('_id', uuid => this.emit('id', uuid))
    this.socket.on('_heartbeat', ({ latest, avg }) => {
      this.socket.emit('_heartbeat_ack')
    })
    this.socket.on('event', event => this.emit('event', event))
    this.socket.on('disconnect', () => {
      this.socket.off()
      this.emit('disconnect')
    })
  }

  sendEvent (event) {
    this.socket.emit('event', event)
  }

  sendCommand (cmd) {
    this.socket.emit('cmd', cmd)
  }
}

export default function createSocketClient (namespace = '/clients') {
  return new SocketClient(namespace)
}
