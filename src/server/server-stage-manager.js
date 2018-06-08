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
  let currentStageNo = -1
  let stopStage

  let commands = {}
  let events = {}

  stages = flattenDeep(stages)
  /** Return current stage with number attached (or null) */
  function getStage (stageNo) {
    return (stageNo >= 0 && stageNo < stages.length)
      ? { ...stages[stageNo], number: stageNo }
      : null
  }

  function checkIfDone () {
    let players = getPlayers().filter(p => p !== undefined).sort()

    if (difference(players, finishedPlayers.sort()).length === 0) {
      finishedPlayers = []
      nextStage()
    }
  }

  function playerFinishedStage (player, stageNo) {
    if (stageNo !== currentStageNo) {
      return
    }

    finishedPlayers = uniq([...finishedPlayers, player])
    checkIfDone()
  }

  function start () {
    if (currentStageNo === -1 && !started) {
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
    if (currentStageNo >= 0 && currentStageNo < stages.length) {
      onStageEnded(getStage(currentStageNo))
    }
  }

  function nextStage () {
    if (!started ||
      currentStageNo >= stages.length) {
      return
    }

    stopCurrentStage()

    currentStageNo++
    if (currentStageNo >= stages.length) {
      return onGameOver()
    }

    let stage = stages[currentStageNo]
    events = stage.events || {}
    commands = stage.commands || {}

    stopStage = runStage({
      ...stage,
      context: getContext(),
      timeout: nextStage
    })

    onStageStarted(getStage(currentStageNo))
  }

  function reset () {
    stopCurrentStage()
    currentStageNo = -1
    started = false
  }

  return {
    getCurrentStage: () => getStage(currentStageNo),
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
