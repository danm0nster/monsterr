import createHttpServer from './http-server'
import createSocketServer from './socket-server'
import createManager from './server-stage-manager'

import Logger from './logger'
import * as Network from './network'
import { handleEvent, handleCommand } from '../util'
import { builtinAdminCommands } from './commands'
import { builtinEvents } from './events'

import * as Events from '../events'

export default function createServer ({
  network = Network.pairs(16),
  logger = Logger({}),
  events = {},
  commands = {},
  adminCommands = {},
  stages = [],
  options: {
    port = 3000,
    resumeCurrentStage = false,
    clientPassword = '',
    adminPassword = ''
  } = {}
} = {}) {
  let stageManager
  const nameMap = {}

  const httpServer = createHttpServer({
    port,
    clientPassword,
    adminPassword
  })
  const socketServer = createSocketServer(httpServer.getIO())

  function send (topic, message) {
    const event = { type: topic, payload: message }
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
      onStageStarted: stageNo => {
        internalHandleEvent({ type: Events.START_STAGE, payload: stageNo })
        monsterr.send(Events.START_STAGE, stageNo).toAll()
      },
      onStageEnded: stageNo => {
        internalHandleEvent({ type: Events.END_STAGE, payload: stageNo })
        monsterr.send(Events.END_STAGE, stageNo).toAll()
      },
      onGameOver: () => {
        internalHandleEvent({ type: Events.GAME_OVER })
        monsterr.send(Events.GAME_OVER).toAll()
      },
      stages
    })
  }

  function start () {
    stageManager.start()
  }

  function log (msg, fileOrExtra, extra) {
    logger.log(msg, fileOrExtra, extra)
  }

  function internalHandleEvent (event) {
    handleEvent(event, [
      events,
      builtinEvents,
      stageManager.getEvents()
    ], monsterr)
  }

  socketServer.on('cmd', cmd => handleCommand(cmd, [
    commands,
    stageManager.getCommands(),
    !cmd.clientId ? builtinAdminCommands : {},
    !cmd.clientId ? adminCommands : {}
  ], monsterr))
  socketServer.on('event', internalHandleEvent)

  const resumeStageForPlayer = (player) => {
    const currentStage = stageManager.getCurrentStage()
    if (resumeCurrentStage && currentStage !== -1) {
      setTimeout(
        () => monsterr.send(Events.START_STAGE, currentStage).toClient(player),
        200
      )
    }
  }

  socketServer.on(Events.CLIENT_RECONNECTED, player => {
    console.log(player, 'reconnected!')
    internalHandleEvent({ type: Events.CLIENT_RECONNECTED, clientId: player })
    resumeStageForPlayer(player)
  })
  socketServer.on(Events.CLIENT_CONNECTED, player => {
    console.log(player, 'connected!')
    network.addPlayer(player)
    internalHandleEvent({ type: Events.CLIENT_CONNECTED, clientId: player })
    resumeStageForPlayer(player)
  })
  socketServer.on(Events.CLIENT_DISCONNECTED, player => {
    console.log(player, 'disconnected!')
    network.removePlayer(player)
    internalHandleEvent({ type: Events.CLIENT_DISCONNECTED, clientId: player })
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
    getLatencies: () => socketServer.getLatencies(),

    setName: (id, name) => {
      const prevName = monsterr.getName(id)
      nameMap[id] = name
      monsterr.send(Events.SET_NAME, { id, name, prevName }).toClient(id)
      monsterr.send(Events.RENAME, { id, name, prevName }).toNeighboursOf(id)
    },
    getName: id => nameMap[id] || id
  }

  return monsterr
}
