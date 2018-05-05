/* globals describe it expect jest beforeEach */
import createManager from './stages'

/**
 * Define some stages
 */
let regularStage = {
  serverSide: {
    setup: jest.fn(),
    teardown: jest.fn()
  },
  clientSide: {
    setup: jest.fn(),
    teardown: jest.fn()
  },
  options: {}
}

let timedStage = {
  ...regularStage,
  options: {
    duration: 100,
    timeOnServer: true
  }
}
let clientTimedStage = {
  ...timedStage,
  options: {
    duration: 100
  }
}

let createOptions = {
  getContext: jest.fn(() => ({
    getCanvas () { return { remove () {}, getObjects () { return [] } } }
  })),
  getPlayers: () => ['1', '2'], // fake two players
  onStageStarted: jest.fn(),
  onStageEnded: jest.fn(),
  onGameOver: jest.fn()
}

describe('manager', () => {
  beforeEach(() => {
    createOptions.onStageStarted.mockClear()
    createOptions.onStageEnded.mockClear()
    createOptions.onGameOver.mockClear()
    regularStage.serverSide.setup.mockClear()
    regularStage.serverSide.teardown.mockClear()
    regularStage.clientSide.setup.mockClear()
    regularStage.clientSide.teardown.mockClear()
  })

  it('start should start the first stage', () => {
    let man = createManager({
      ...createOptions,
      stages: [regularStage, timedStage]
    })
    man.start()
    expect(createOptions.onStageStarted).toBeCalledWith(0)
  })

  it('extraneous start calls should be ignored', () => {
    let man = createManager({
      ...createOptions,
      stages: [regularStage, timedStage]
    })
    man.start()
    expect(createOptions.onStageStarted).toBeCalledWith(0)
    man.start()
    man.start()
    expect(createOptions.onStageEnded).not.toBeCalledWith(0)
  })

  it('next should proceed to next stage', () => {
    let man = createManager({
      ...createOptions,
      stages: [regularStage, timedStage]
    })
    man.start()
    man.next()
    expect(createOptions.onStageEnded).toBeCalledWith(0)
    expect(createOptions.onStageStarted).toBeCalledWith(1)
  })

  it('currentStage should return current stage #', () => {
    let man = createManager({
      ...createOptions,
      stages: [regularStage, timedStage]
    })
    expect(man.getCurrentStage()).toBe(-1)
    man.start()
    expect(man.getCurrentStage()).toBe(0)
    man.next()
    expect(man.getCurrentStage()).toBe(1)
  })

  it('next results in game over when no more stages', () => {
    let man = createManager({
      ...createOptions,
      stages: [regularStage, timedStage]
    })
    man.start()
    man.next()
    man.next() // no more
    expect(createOptions.onGameOver).toBeCalled()
  })

  it('after game over, nothing further happens', () => {
    let man = createManager({
      ...createOptions,
      stages: [regularStage, timedStage]
    })
    man.start()
    man.next()
    man.next()
    man.start() // extraneous start
    man.next() // and next
    expect(createOptions.onGameOver).toBeCalled()
    expect(man.getCurrentStage()).toBe(2) // not reset
  })

  it('server-timed stage finishes after duration', (done) => {
    let man = createManager({
      ...createOptions,
      stages: [timedStage]
    })
    man.start()
    setTimeout(() => {
      expect(createOptions.onStageStarted).toBeCalledWith(0)
      expect(createOptions.onStageEnded).toBeCalledWith(0)
      done()
    }, 110)
  })

  it('server-timed stage can be terminated early', () => {
    let man = createManager({
      ...createOptions,
      stages: [timedStage]
    })
    man.start()
    man.next()
    expect(createOptions.onStageStarted).toBeCalledWith(0)
    expect(createOptions.onStageEnded).toBeCalledWith(0)
  })

  it('client-timed stage can be terminated early', () => {
    let man = createManager({
      ...createOptions,
      stages: [clientTimedStage]
    })
    man.start()
    man.next()
    expect(createOptions.onStageStarted).toBeCalledWith(0)
    expect(createOptions.onStageEnded).toBeCalledWith(0)
  })

  it('client-timed stage terminates after duration', (done) => {
    let man = createManager({
      ...createOptions,
      stages: [clientTimedStage]
    })
    man.start()
    setTimeout(() => {
      expect(createOptions.onStageEnded).toBeCalledWith(0)
      done()
    }, 110)
  })
})
