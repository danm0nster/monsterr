function runStage (monsterr, {
  setup,
  teardown,
  options: {
    duration,
    time
  } = {}
}, onTimeout) {
  let timer
  if (duration && time) {
    timer = setTimeout(() => terminateStage(true), duration)
  }

  setup && setup(monsterr)

  /* Attach screen events and commands */

  let terminated = false
  function terminateStage (byTimer = false) {
    if (terminated) { return }
    terminated = true

    if (timer) { clearTimeout(timer) }
    teardown && teardown(monsterr, byTimer)
  }

  // We return a function that can be called to terminate the stage
  return () => terminateStage(false)
}

function runStageOnServer (monsterrServer, {
  options: {
    timeOnServer,
    duration
  } = {},
  serverSide
}, onTimeout) {
  return runStage(monsterrServer, {
    setup: serverSide.setup,
    teardown: (monsterr, byTimer = false) => {
      serverSide.teardown(monsterr)
      if (byTimer) {
        onTimeout && onTimeout()
      }
    },
    options: {
      // We always keep a timeout on the server,
      // it is just doubled in case the clients are
      // to time themselves to allow for big descrepencies.
      time: true,
      duration: timeOnServer ? duration : duration * 2
    }
  })
}

function runStageOnClient (monsterrClient, {
  options: {
    timeOnServer,
    duration
  } = {},
  clientSide
}, onTimeout) {
  return runStage(monsterrClient, {
    setup: clientSide.setup,
    teardown: (monsterr, byTimer) => {
      clientSide.teardown(monsterr)
      if (byTimer) {
        onTimeout && onTimeout()
      }
    },
    options: {
      time: !timeOnServer,
      duration
    }
  })
}

/**
 * Manages the stages on server.
 * @param {*} stages
 */
function createManager (monsterr, stages = []) {
  let playerCount = 0
  let finishedPlayers = 0

  function checkIfDone () {
    console.log(finishedPlayers, 'out of', playerCount)
    if (finishedPlayers >= playerCount) {
      finishedPlayers = 0
      nextStage()
    }
  }

  function playerFinishedStage (stageNo) {
    if (stageNo !== currentStage) {
      return
    }

    finishedPlayers++
    checkIfDone()
  }

  let currentStage = -1

  function start () {
    if (currentStage === -1) { nextStage() }
  }

  let stopStage
  function stopCurrentStage () {
    if (stopStage) {
      stopStage()
    }
    if (currentStage >= 0 && currentStage < stages.length) {
      monsterr.send('_end_stage', currentStage).toAll()
    }
  }
  function nextStage () {
    if (currentStage >= stages.length) { return } // already game over

    stopCurrentStage()

    currentStage++
    if (currentStage >= stages.length) {
      return monsterr.send('_game_over').toAll()
    }

    let stage = stages[currentStage]
    console.log(stage, currentStage)

    stopStage = runStageOnServer(monsterr, stage, nextStage)
    monsterr.send('_start_stage', currentStage).toAll()
  }

  function reset () {
    stopCurrentStage()
    currentStage = -1
  }

  return {
    stages: () => stages,
    getCurrentStage: () => currentStage,

    setPlayerCount (c) {
      playerCount = c
      checkIfDone()
      return this
    },
    playerFinishedStage,

    start,
    nextStage,
    reset
  }
}

module.exports = {
  runStageOnServer,
  runStageOnClient,
  createManager
}
