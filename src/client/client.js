import { EventEmitter } from 'events'
import { flattenDeep } from 'lodash'

import createChat from './chat.js'
import createCanvas from './canvas.js'
import { runStage } from '../stages.js'

const defaultOptions = {
  staticCanvas: false,
  chatHeight: 200,
  canvasBackgroundColor: '#999'
}

const builtinEvents = {
  _msg (monsterr, msg) {
    monsterr.getChat().append(msg)
  },
  _start_stage (monsterr, stageNo) {
    console.log('_start_stage', stageNo)
    monsterr.startStage(stageNo)
  },
  _end_stage (monsterr, stageNo) {
    console.log('_end_stage', stageNo)
    monsterr.endStage(stageNo)
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

// function createAdminClient ({
//   admin: {
//     options = {},
//     events = {},
//     commands = {}
//   } = {},
//   stages = []
// }) {

//   return {
//     chat,

//   }
// }

function createClient ({
  options = {},
  events = {},
  commands = {},
  stages = []
} = {}) {
  const emitter = new EventEmitter()

  let stageEvents = {}
  let stageCommands = {}

  options = Object.assign(defaultOptions, options)
  commands = Object.assign(builtinCommands, commands)

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

  const canvas = createCanvas(options)
  const chat = createChat({
    onCmd: (cmd, ...args) => handleCommand(cmd),
    onMsg: msg => sendEvent('_msg', msg)
  })

  function handleEvent ({ type, payload }) {
    console.log('EVENT:', { type, payload })
    builtinEvents[type] &&
      builtinEvents[type](monsterr, payload)

    events[type] &&
      events[type](monsterr, payload)

    stageEvents[type] &&
      stageEvents[type](monsterr, payload)
  }

  function handleCommand ({ type, args }) {
    console.log('CMD:', { type, args })

    let builtinShouldCallServer = builtinCommands[type] &&
      builtinCommands[type](monsterr, args)

    let cmdShouldCallServer = commands[type] &&
      commands[type](monsterr, args)

    let stageShouldCallServer = stageCommands[type] &&
      stageCommands[type](monsterr, args)

    // If no handler has told us not to send cmd to server, we send it!
    if (builtinShouldCallServer !== false && cmdShouldCallServer !== false && stageShouldCallServer !== false) {
      sendCommand({ type, args })
    }
  }

  let stopStage
  let currentStage = -1
  function startStage (stageNo) {
    if (stageNo >= stages.length) {
      return
    }
    stopStage && stopStage()

    currentStage = stageNo
    let stage = stages[currentStage];

    ({
      stopStage,
      events: stageEvents,
      commands: stageCommands
    } = runStage(monsterr, stage, () => {
      console.log('timed out')
      monsterr.send('_stage_finished', currentStage)
    }))
  }

  function endStage (stageNo) {
    if (stageNo === currentStage) {
      stopStage && stopStage()
    }
    stageEvents = {}
    stageCommands = {}
  }

  function stageFinished () {
    monsterr.send('_stage_finished', currentStage)
  }

  /** API */
  const monsterr = {
    send: sendEvent,
    log,
    getCanvas: () => canvas,
    getChat: () => chat,

    startStage,
    endStage,
    stageFinished,

    handleEvent,
    handleCommand,

    getCommands () { return commands },
    getEvents () { return events },
    getStages () { return stages },

    renderHtml: html => $('#html-container').html(html)
  }

  /** Events */

  return { monsterr, emitter }
  /* In the future we might have to handle clients connecting,
   * so that the client code can rely on client being initialized
   * properly.
   */
  // return new Promise((resolve, reject) => {
  //   socket.on('connect', () => {
  //     monsterr.id = socket.id
  //     resolve(monsterr)
  //   })
  // })
}

export default createClient
