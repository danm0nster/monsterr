const { EventEmitter } = require('events')

const Logger = require('./logger')
const Network = require('./network')

const { createManager } = require('./stages')

const defaultOptions = {
  port: 3000
}

const builtinAdminCommands = {
  start (monsterr) {
    monsterr.start()
  },
  next (monsterr) {
    monsterr.getStageManager().nextStage()
  },
  reset (monsterr) {
    monsterr.getStageManager().reset()
  }
}

const builtinEvents = {
  _msg (monsterr, clientId, msg) {
    // relay chat messages to group members
    monsterr.send('_msg', msg).toNeighboursOf(clientId)
  },
  _log (monsterr, _, json) {
    monsterr.log(json.msg, json.fileOrExtra, json.extra)
  },
  _stage_finished (monsterr, _, stageNo) {
    monsterr.getStageManager().playerFinishedStage(stageNo)
  }
}

export default (opts, startServer) => {
  function createServer ({
    network = Network.pairs(16),
    logger = Logger({}),
    options = {},
    events = {},
    commands = {},
    adminCommands = {},
    stages = []
  } = {}) {
    options = Object.assign(defaultOptions, options)

    /**
     * Using an emitter to abstract away sending events to and from clients.
     */
    const emitter = new EventEmitter()

    function send (topic, message) {
      let event = { type: topic, payload: message }
      return {
        toAll () {
          emitter.emit('eventAll', event)
        },
        toClient (socketId) {
          emitter.emit('eventClients', event, [socketId])
        },
        toNeighboursOf (socketId) {
          emitter.emit('eventClients', event, [socketId].concat(monsterr.network.getNeighbours(socketId)))
        },
        toNeighboursOfExclusive (socketId) {
          emitter.emit('eventClients', event, monsterr.network.getNeighbours(socketId))
        },
        toClients (clients = []) {
          emitter.emit('eventClients', event, clients)
        },
        toAdmin () {
          emitter.emit('eventAdmin', event)
        }
      }
    }

    /** Manage stages */
    let stageManager

    function run () {
      startServer(options.port)
      stageManager = createManager(monsterr, stages)
    }

    function start () {
      stageManager.start()
    }

    function log (msg, fileOrExtra, extra) {
      return logger.log(msg, fileOrExtra, extra)
    }

    function handleCommand ({ type, args, clientId }) {
      console.log('CMD:', type, args, clientId)

      // no clientID means it came from admin
      if (!clientId) {
        builtinAdminCommands[type] &&
          builtinAdminCommands[type](monsterr, ...args)

        adminCommands[type] &&
          adminCommands[type](monsterr, ...args)
      }

      commands[type] &&
        commands[type](monsterr, clientId, ...args)
    }

    function handleEvent ({ type, payload, clientId }) {
      console.log('EVENT:', { type, payload, clientId })
      // check builtin
      builtinEvents[type] &&
        builtinEvents[type](monsterr, clientId, payload)

      // check provided
      events[type] &&
        events[type](monsterr, clientId, payload)
    }

    /** API */
    const monsterr = {
      network,

      run,
      start,
      send,
      log,

      handleCommand,
      handleEvent,

      clientConnected (clientId) { network.addPlayer(clientId) },
      clientDisconnected (clientId) { network.removePlayer(clientId) },

      getStageManager () { return stageManager },
      getCommands () { return commands },
      getEvents () { return events }
    }

    return { monsterr, emitter }
  }

  return createServer(opts)
}
