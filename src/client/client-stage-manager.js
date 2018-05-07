import runStage from '../run-stage'

function runOnClient ({
  stage: {
    html,
    clientSide: {
      setup,
      teardown
    } = {},
    options: {
      duration,
      timeOnServer,
      htmlContainerHeight
    } = {}
  } = {},
  context = {},
  timeout
}) {
  // adjust html container
  let preHtmlContainerHeight
  let modifiedSetup = () => {
    preHtmlContainerHeight = context.getHtmlContainer().getHeightRatio()
    htmlContainerHeight && context.getHtmlContainer().setHeightRatio(htmlContainerHeight)

    html && context.renderHtml(html)
    setup && setup(context)
  }

  let modifiedTeardown = () => {
    preHtmlContainerHeight && context.getHtmlContainer().setHeightRatio(preHtmlContainerHeight)
    context.renderHtml('')

    context.getCanvas().remove(...context.getCanvas().getObjects())

    teardown && teardown(context)
  }

  return runStage({
    context,
    duration: !timeOnServer ? duration : undefined,
    setup: modifiedSetup,
    teardown: modifiedTeardown
  })
}

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
        console.log('timed out')
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
