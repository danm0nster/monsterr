import { EventEmitter } from 'events'
import { flattenDeep } from 'lodash'

import createChat from './chat.js'
import createCanvas from './canvas.js'
import createHtmlContainer from './html-container'
import createManager from './client-stage-manager'

import { handleEvent, handleCommand } from '../util'

const builtinEvents = {
  _msg (monsterr, msg) {
    monsterr.getChat().append(msg)
  }
}

const builtinClientOnlyEvents = {
  _start_stage (monsterr, stageNo) {
    console.log('_start_stage', stageNo)
    monsterr.getStageManager().startStage(stageNo)
  },
  _end_stage (monsterr, stageNo) {
    console.log('_end_stage', stageNo)
    monsterr.getStageManager().endStage(stageNo)
  },
  _game_over (monsterr) {
    console.log('_game_over')
  }
}

const builtinCommands = {
  clear (monsterr, ...args) {
    monsterr.getChat().clear()
    return false // don't send this
  },
  id (monsterr) {
    monsterr.getChat().append(monsterr.getId())
  }
}

function createClient ({
  options = {},
  events = {},
  commands = {},
  stages = [],
  adminClient = false
} = {}) {
  let clientId
  const emitter = new EventEmitter()

  stages = flattenDeep(stages)

  function sendCommand (type, args = []) {
    emitter.emit('cmd', { type, args })
  }

  function sendEvent (type, payload) {
    emitter.emit('event', {
      type, payload
    })
  }

  function log (msg, fileOrExtra, extra) {
    sendEvent('_log', { msg, fileOrExtra, extra })
  }

  const chat = createChat({
    onCmd: cmd => monsterr.handleCommand(cmd),
    onMsg: msg => sendEvent('_msg', msg),
    hidden: options.hideChat || false
  })
  const htmlContainer = createHtmlContainer(options)
  const canvas = createCanvas({
    ...options,
    getUsedWidth: () => chat.isHidden() ? 0 : 300,
    getUsedHeight: () => htmlContainer.getHeightAbs()
  })

  const stageManager = !adminClient ? createManager({
    stages,
    getContext: () => monsterr,
    onStageFinished: stageNo => {
      monsterr.send('_stage_finished', stageNo)
    }
  }) : undefined

  /** API */
  const monsterr = {
    send: sendEvent,
    sendCommand,
    log,

    setId (id) { clientId = id },
    getId: () => clientId,

    getChat: () => chat,
    getHtmlContainer: () => htmlContainer,
    getCanvas: () => canvas,
    getStageManager: () => stageManager,

    handleEvent: event => handleEvent(event, [
      events,
      builtinEvents,
      adminClient ? {} : builtinClientOnlyEvents,
      adminClient ? {} : stageManager.getEvents()
    ], monsterr),
    handleCommand: cmd => {
      let shouldCallServer = handleCommand(cmd, [
        commands,
        builtinCommands,
        adminClient ? {} : stageManager.getCommands()
      ], monsterr)

      if (shouldCallServer) {
        sendCommand(cmd.type, cmd.args)
      }
    },

    getCommands () { return commands },
    getEvents () { return events },
    getStages () { return stages },

    renderHtml: html => htmlContainer.render(html),
    disconnect () {
      htmlContainer.setHeightRatio(1)
      htmlContainer.render('<h1>Disconnected...</h1>')
    }
  }

  return { monsterr, emitter }
}

export default createClient
