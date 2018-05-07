import createManager from './stages'
import { createHttpServer, createSocketServer } from './express-server'

import Logger from './logger'
import * as Network from './network'

const defaultOptions = {
  port: 3000
}

const builtinAdminCommands = {
  start (monsterr) {
    monsterr.start()
  },
  next (monsterr) {
    monsterr.getStageManager().next()
  },
  reset (monsterr) {
    monsterr.getStageManager().reset()
  },
  players (monsterr) {
    monsterr.send('_msg', monsterr.getNetwork().getPlayers().join(', ')).toAdmin()
  }
}

const builtinEvents = {
  _msg (monsterr, clientId, msg) {
    monsterr.send('_msg', msg).toNeighboursOf(clientId)
  },
  _log (monsterr, _, json) {
    monsterr.log(json.msg, json.fileOrExtra, json.extra)
  },
  _stage_finished (monsterr, clientId, stageNo) {
    monsterr.getStageManager().playerFinishedStage(clientId, stageNo)
  }
}

export default function createServer ({
  network = Network.pairs(16),
  logger = Logger({}),
  options = {},
  events = {},
  commands = {},
  adminCommands = {},
  stages = []
} = {}) {
  let stageManager
  const socketServer = createSocketServer()

  options = Object.assign(defaultOptions, options)

  function send (topic, message) {
    let event = { type: topic, payload: message }
    return {
      toAll () {
        socketServer.sendEvent(event).toAll()
      },
      toClient (clientId) {
        socketServer.sendEvent(event).toClients([clientId])
      },
      toNeighboursOf (clientId) {
        socketServer.sendEvent(event).toClients([clientId].concat(network.getNeighbours(clientId)))
      },
      toNeighboursOfExclusive (clientId) {
        socketServer.sendEvent(event).toClients(network.getNeighbours(clientId))
      },
      toClients (clients = []) {
        socketServer.sendEvent(event).toClients(clients)
      },
      toAdmin () {
        socketServer.sendEvent(event).toAdmin()
      }
    }
  }

  function run () {
    createHttpServer({ port: options.port })
    stageManager = createManager({
      getContext: () => monsterr,
      getPlayers: () => network.getPlayers(),
      onStageStarted: stageNo => monsterr.send('_start_stage', stageNo).toAll(),
      onStageEnded: stageNo => monsterr.send('_end_stage', stageNo).toAll(),
      onGameOver: () => monsterr.send('_game_over').toAll(),
      stages
    })
  }

  function start () {
    stageManager.start()
  }

  function log (msg, fileOrExtra, extra) {
    logger.log(msg, fileOrExtra, extra)
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

    let stageCommands = stageManager.getCommands()
    stageCommands[type] &&
        stageCommands[type](monsterr, clientId, ...args)
  }

  function handleEvent ({ type, payload, clientId }) {
    console.log('EVENT:', { type, payload, clientId })
    // check builtin
    builtinEvents[type] &&
        builtinEvents[type](monsterr, clientId, payload)

    // check provided
    events[type] &&
        events[type](monsterr, clientId, payload)

    let stageEvents = stageManager.getEvents()
    stageEvents[type] &&
        stageEvents[type](monsterr, clientId, payload)
  }

  socketServer.on('cmd', cmd => handleCommand(cmd))
  socketServer.on('event', event => handleEvent(event))
  socketServer.on('connect', player => {
    console.log(player, 'connected!')
    network.addPlayer(player)
  })
  socketServer.on('disconnect', player => {
    console.log(player, 'disconnected!')
    network.removePlayer(player)
    stageManager.playerDisconnected(player)
  })

  /** API */
  const monsterr = {
    run,
    start,
    send,
    log,

    getNetwork: () => network,
    getStageManager: () => stageManager,
    getCommands: () => commands,
    getEvents: () => events
  }

  return monsterr
}
