import { EventEmitter } from 'events'
import io from 'socket.io-client'

import * as Events from '../events'

class SocketClient extends EventEmitter {
  constructor (namespace) {
    super()

    this.socket = io(namespace, {
      reconnection: false
    })
    this.setupHandlers()
  }

  setupHandlers () {
    this.socket.on(Events.SET_ID, uuid => this.emit(Events.SET_ID, uuid))
    this.socket.on(Events.HEARTBEAT, ({ latest, avg }) => {
      this.socket.emit(Events.HEARTBEAT_ACK)
    })
    this.socket.on('event', event => this.emit('event', event))
    this.socket.on('disconnect', () => {
      this.socket.off()
      this.emit(Events.CLIENT_DISCONNECTED)
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
