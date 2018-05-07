import { runStage } from '../stages'

function createStageManager ({
  stages = [],
  onStageFinished,
  getContext
}) {
  let stageEvents = []
  let stageCommands = []

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
    } = runStage(getContext(), stage, () => {
      console.log('timed out')
      onStageFinished(currentStage)
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
    onStageFinished(currentStage)
  }

  return {
    startStage,
    endStage,
    stageFinished,

    getEvents: () => stageEvents,
    getCommands: () => stageCommands
  }
}

export default createStageManager
