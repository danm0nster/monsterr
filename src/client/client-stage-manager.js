import runStage from '../run-stage'

/**
 * Enhances stage running with:
 * - html rendering
 * - canvas clearing
 */
function runOnClient ({
  stage: {
    html,
    setup,
    teardown,
    options: {
      duration,
      htmlContainerHeight
    } = {}
  } = {},
  context = {},
  timeout
}) {
  let preHtmlContainerHeight
  let modifiedSetup = () => {
    preHtmlContainerHeight = context.getHtmlContainer().getHeightRatio()
    htmlContainerHeight && context.getHtmlContainer().setHeightRatio(htmlContainerHeight)

    html && context.renderHtml(html)
    setup && setup(context)
  }

  let modifiedTeardown = () => {
    context.getHtmlContainer().setHeightRatio(preHtmlContainerHeight)
    context.renderHtml('')

    context.getCanvas().remove(...context.getCanvas().getObjects())

    teardown && teardown(context)
  }

  return runStage({
    context,
    timeout,
    setup: modifiedSetup,
    teardown: modifiedTeardown,
    options: {
      duration
    }
  })
}

/**
 * Manages stages on the client.
 */
function createManager ({
  stages = [],
  onStageFinished,
  getContext
}) {
  let events = {}
  let commands = {}

  let stopStage
  let currentStage = -1
  function startStage (stageNo) {
    if (stageNo >= stages.length) {
      return
    }
    stopStage && stopStage()

    currentStage = stageNo
    let stage = stages[currentStage]
    events = stage.events || {}
    commands = stage.commands || {}

    stopStage = runOnClient({
      stage,
      context: getContext(),
      timeout: () => {
        onStageFinished(currentStage)
      }
    })
  }

  function endStage (stageNo) {
    if (stageNo === currentStage) {
      stopStage && stopStage()
    }
    events = {}
    commands = {}
  }

  function stageFinished () {
    onStageFinished(currentStage)
  }

  return {
    startStage,
    endStage,
    stageFinished,

    getEvents: () => events,
    getCommands: () => commands
  }
}

export default createManager
