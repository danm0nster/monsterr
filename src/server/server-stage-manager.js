import { uniq, difference, flattenDeep } from 'lodash'

import runStage from '../run-stage'

/**
 * Manages stages on server.
 *
 * TODO: This is overloaded/complex and ripe for refactoring.
 * Given the event nature, this could be an EventEmitter.
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

  function checkIfDone () {
    let players = getPlayers().filter(p => p !== undefined).sort()

    if (difference(players, finishedPlayers.sort()).length === 0) {
      finishedPlayers = []
      nextStage()
    }
  }

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
    events = stage.events || {}
    commands = stage.commands || {}

    stopStage = runStage({
      ...stage,
      context: getContext(),
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
