import { uniq, difference, flattenDeep } from 'lodash'

import runStage from '../run-stage'

function runOnServer ({
  stage: {
    serverSide: {
      setup,
      teardown
    } = {},
    options: {
      duration,
      timeOnServer
    } = {}
  } = {},
  context = {},
  timeout
}) {
  return runStage({
    context,
    duration: timeOnServer ? duration : duration * 2,
    timeout,
    setup,
    teardown
  })
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

    let stage = stages[currentStage]
    let serverSide = stage.serverSide || {}
    events = serverSide.events || {}
    commands = serverSide.commands || {}

    stopStage = runOnServer({
      context: getContext(),
      stage,
      timeout: nextStage
    })

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
