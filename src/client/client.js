import { EventEmitter } from 'events'
import { flattenDeep } from 'lodash'

import createChat from './chat.js'
import createCanvas from './canvas.js'
import createHtmlContainer from './html-container'
import createManager from './client-stage-manager'

function handleEvent ({ type, payload }, handlers, context) {
  console.log('EVENT:', { type, payload })
  handlers.forEach(handler => handler[type] &&
    handler[type](context, payload))
}

function handleCommand ({ type, args }, handlers, context) {
  console.log('CMD:', { type, args })
  return handlers.reduce((shouldCall, handler) => {
    let res = handler[type] && handler[type](context, args)
    return (res === false) ? false : shouldCall
  }, true)
}

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
  }
}

function createClient ({
  options = {},
  events = {},
  commands = {},
  stages = [],
  adminClient = false
} = {}) {
  const emitter = new EventEmitter()

  stages = flattenDeep(stages)

  function sendCommand (cmd) {
    emitter.emit('cmd', cmd)
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
    onCmd: (cmd, ...args) => monsterr.handleCommand(cmd),
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
    sendCommand: (cmd, ...args) => sendCommand({ type: cmd, args: args || [] }),
    log,

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
        sendCommand(cmd)
      }
    },

    getCommands () { return commands },
    getEvents () { return events },
    getStages () { return stages },

    renderHtml: html => htmlContainer.render(html)
  }

  return { monsterr, emitter }
}

export default createClient
