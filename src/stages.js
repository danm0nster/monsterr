import { uniq, difference, flattenDeep } from 'lodash'
import isBrowser from './is-browser'

export function runStage (context, {
  html,
  serverSide,
  clientSide,
  options: {
    duration,
    timeOnServer
  } = {}
}, onTimeout) {
  const {
    events = {},
    commands = {},
    setup,
    teardown
  } = isBrowser ? clientSide : serverSide

  let timer
  let terminated = false

  if (html && isBrowser) {
    context.renderHtml(html)
  }

  function modifiedTeardown (byTimer = false) {
    teardown && teardown(context)

    if (isBrowser) {
      context.getCanvas().remove(...context.getCanvas().getObjects())
      context.renderHtml('')
    }

    if (byTimer) {
      onTimeout && onTimeout()
    }
  }

  function terminateStage (byTimer = false) {
    if (terminated) { return }
    terminated = true

    if (timer) { clearTimeout(timer) }
    modifiedTeardown(byTimer)
  }

  if (duration && !isBrowser) {
    timer = setTimeout(() => terminateStage(true), timeOnServer ? duration : duration * 2)
  } else if (duration) {
    timer = setTimeout(() => terminateStage(true), duration)
  }

  setup && setup(context)

  return {
    stopStage: () => terminateStage(false),
    events,
    commands
  }
}

export function repeat (stage = {}, n = 2) {
  return Array(n).fill(stage) // _.cloneDeep(stage)?
}

export function timeOnServer (stage = {}) {
  return {
    ...stage,
    options: {
      ...stage.options,
      timeOnServer: true
    }
  }
}

export function withDuration (stage = {}, duration = 10000) {
  return {
    ...stage,
    options: {
      ...stage.options,
      duration
    }
  }
}

/**
 * Manages the stages on server.
 * @param {*} stages
 */
function createManager ({
  getContext = () => ({}),
  getPlayers = () => [],
  onStageStarted = () => {},
  onStageEnded = () => {},
  onGameOver = () => {},
  stages = []
} = {}) {
  let started = false
  let finishedPlayers = []
  let currentStage = -1
  let stopStage

  let commands = {}
  let events = {}

  stages = flattenDeep(stages)

  // We are done when all players are finished
  function checkIfDone () {
    let players = getPlayers().filter(p => p !== undefined).sort()

    if (difference(players, finishedPlayers.sort()).length === 0) {
      finishedPlayers = []
      nextStage()
    }
  }

  // Mark player as finished with current stage
  function playerFinishedStage (player, stageNo) {
    if (stageNo !== currentStage) {
      return
    }

    finishedPlayers = uniq([...finishedPlayers, player])
    checkIfDone()
  }

  function start () {
    if (currentStage === -1 && !started) {
      started = true
      nextStage()
    }
  }

  function stopCurrentStage () {
    events = {}
    commands = {}

    if (stopStage) {
      stopStage()
    }
    if (currentStage >= 0 && currentStage < stages.length) {
      onStageEnded(currentStage)
    }
  }
  function nextStage () {
    if (!started ||
      currentStage >= stages.length) {
      return
    }

    stopCurrentStage()

    currentStage++
    if (currentStage >= stages.length) {
      return onGameOver()
    }

    let stage = stages[currentStage];

    ({
      stopStage,
      events,
      commands
    } = runStage(getContext(), stage, nextStage))

    onStageStarted(currentStage)
  }

  function reset () {
    stopCurrentStage()
    currentStage = -1
    started = false
  }

  return {
    getCurrentStage: () => currentStage,
    getEvents: () => events,
    getCommands: () => commands,

    // helpers
    playerFinishedStage,
    playerDisconnected: checkIfDone,

    // control stage flow
    start,
    next: nextStage,
    reset
  }
}

export default createManager
