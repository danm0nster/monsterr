import createHttpServer from './http-server'
import createSocketServer from './socket-server'
import createManager from './server-stage-manager'

import Logger from './logger'
import * as Network from './network'
import { handleEvent, handleCommand } from '../util'

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
    monsterr.send(
      '_msg',
      monsterr.getNetwork().getPlayers().join(', ')
    ).toAdmin()
  },
  latencies (monsterr) {
    monsterr.send('_msg', JSON.stringify(monsterr.getLatencies())).toAdmin()
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
  const httpServer = createHttpServer({ port: options.port })
  const socketServer = createSocketServer(httpServer.getIO())
  let stageManager

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
        socketServer
          .sendEvent(event)
          .toClients([clientId].concat(network.getNeighbours(clientId)))
      },
      toNeighboursOfExclusive (clientId) {
        socketServer
          .sendEvent(event)
          .toClients(network.getNeighbours(clientId))
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

  socketServer.on('cmd', cmd => handleCommand(cmd, [
    commands,
    stageManager.getCommands(),
    !cmd.clientId ? builtinAdminCommands : {},
    !cmd.clientId ? adminCommands : {}
  ], monsterr))
  socketServer.on('event', event => handleEvent(event, [
    events,
    builtinEvents,
    stageManager.getEvents()
  ], monsterr))

  const resumeCurrentStage = (player) => {
    const currentStage = stageManager.getCurrentStage()
    if (options.resumeCurrentStage && currentStage !== -1) {
      setTimeout(
        () => monsterr.send('_start_stage', currentStage).toClient(player),
        200
      )
    }
  }

  socketServer.on('reconnect', player => {
    console.log(player, 'reconnected!')
    resumeCurrentStage(player)
  })
  socketServer.on('connect', player => {
    console.log(player, 'connected!')
    network.addPlayer(player)
    resumeCurrentStage(player)
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
    getEvents: () => events,
    getLatencies: () => socketServer.getLatencies()
  }

  return monsterr
}
