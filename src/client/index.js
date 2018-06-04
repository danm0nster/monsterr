import { flattenDeep } from 'lodash'

import createChat from './chat.js'
import createCanvas from './canvas.js'
import createHtmlContainer from './html-container'
import createManager from './client-stage-manager'
import createSocketClient from './socket-client'
import isAdmin from './is-admin'

import { handleEvent, handleCommand } from '../util'
import { builtinEvents, builtinClientEvents } from './events'
import { builtinCommands } from './commands'

import * as Events from '../events'

function createClient ({
  options = {},
  events = {},
  commands = {},
  stages = []
} = {}) {
  let clientId
  const socketClient = createSocketClient(isAdmin ? '/admin' : '/clients')

  stages = flattenDeep(stages)

  function log (msg, fileOrExtra, extra) {
    socketClient.sendEvent({
      type: Events.LOG,
      payload: { msg, fileOrExtra, extra }
    })
  }

  const chat = createChat({
    onCmd: cmd => {
      let shouldCallServer = handleCommand(cmd, [
        commands,
        builtinCommands,
        isAdmin ? {} : stageManager.getCommands()
      ], monsterr)

      if (shouldCallServer) {
        socketClient.sendCommand(cmd)
      }
    },
    onMsg: msg => monsterr.send(Events.MESSAGE, msg),
    hidden: options.hideChat || false
  })
  const htmlContainer = createHtmlContainer(options)
  const canvas = createCanvas({
    ...options,
    getUsedWidth: () => chat.isHidden() ? 0 : 300,
    getUsedHeight: () => htmlContainer.getHeightAbs()
  })

  const stageManager = !isAdmin ? createManager({
    stages,
    getContext: () => monsterr,
    onStageFinished: stageNo => {
      monsterr.send(Events.STAGE_FINISHED, stageNo)
    }
  }) : undefined

  socketClient.on(Events.SET_ID, id => {
    clientId = id
    chat.append('Your id is: ' + id)
  })
  socketClient.on(Events.CLIENT_DISCONNECTED, () => monsterr.disconnect())
  socketClient.on('event', event => {
    handleEvent(event, [
      events,
      builtinEvents,
      isAdmin ? {} : builtinClientEvents,
      isAdmin ? {} : stageManager.getEvents()
    ], monsterr)
  })

  /** API */
  const monsterr = {
    send: (type, payload) => socketClient.sendEvent({ type, payload }),
    sendCommand: (type, args) => socketClient.sendCommand({ type, args }),
    log,

    getId: () => clientId,

    getChat: () => chat,
    getHtmlContainer: () => htmlContainer,
    getCanvas: () => canvas,
    getStageManager: () => stageManager,

    getCommands () { return commands },
    getEvents () { return events },
    getStages () { return stages },

    renderHtml: html => htmlContainer.render(html),
    disconnect () {
      htmlContainer.setHeightRatio(1)
      htmlContainer.render('<h1>Disconnected...</h1>')
    },
    stageFinished: () => stageManager.stageFinished()
  }

  return monsterr
}

export default createClient
