/* globals describe it expect jest beforeEach */
const {
  createManager
} = require('./stages')

/**
 * Fake monsterr
 */
const sendTargets = {
  toAll: jest.fn(),
  toClient: jest.fn(),
  toAdmin: jest.fn()
}
const monsterrServer = {
  send: jest.fn(() => sendTargets)
}

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
  serverSide: {
    setup: jest.fn(),
    teardown: jest.fn()
  },
  clientSide: {
    setup: jest.fn(),
    teardown: jest.fn()
  },
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

describe('manager', () => {
  beforeEach(() => {
    monsterrServer.send.mockClear()
    sendTargets.toAll.mockClear()
    sendTargets.toAdmin.mockClear()
    sendTargets.toClient.mockClear()
    regularStage.serverSide.setup.mockClear()
    regularStage.serverSide.teardown.mockClear()
    regularStage.clientSide.setup.mockClear()
    regularStage.clientSide.teardown.mockClear()
    timedStage.serverSide.setup.mockClear()
    timedStage.serverSide.teardown.mockClear()
    timedStage.clientSide.setup.mockClear()
    timedStage.clientSide.teardown.mockClear()
  })

  it('manager should expose stages', () => {
    let man = createManager(monsterrServer, [regularStage, timedStage])
    expect(man.stages()).toEqual([regularStage, timedStage])
  })

  it('start should start the first stage', () => {
    let man = createManager(monsterrServer, [regularStage, timedStage])
    man.start()
    expect(monsterrServer.send).toBeCalledWith('_start_stage', 0)
  })

  it('extraneous start calls should be ignored', () => {
    let man = createManager(monsterrServer, [regularStage, timedStage])
    man.start()
    expect(monsterrServer.send).toBeCalledWith('_start_stage', 0)
    man.start()
    man.start()
    expect(monsterrServer.send).not.toBeCalledWith('_end_stage', 0)
    expect(monsterrServer.send).not.toBeCalledWith('_start_stage', 1)
  })

  it('nextStage should proceed to next stage', () => {
    let man = createManager(monsterrServer, [regularStage, timedStage])
    man.start()
    man.nextStage()
    expect(monsterrServer.send).toBeCalledWith('_end_stage', 0)
    expect(monsterrServer.send).toBeCalledWith('_start_stage', 1)
  })

  it('currentStage should return current stage #', () => {
    let man = createManager(monsterrServer, [regularStage, timedStage])
    expect(man.getCurrentStage()).toBe(-1)
    man.start()
    expect(man.getCurrentStage()).toBe(0)
    man.nextStage()
    expect(man.getCurrentStage()).toBe(1)
  })

  it('nextStage results in game over when no more stages', () => {
    let man = createManager(monsterrServer, [regularStage, timedStage])
    man.start()
    man.nextStage()
    man.nextStage() // no more
    expect(monsterrServer.send).toBeCalledWith('_game_over')
  })

  it('game is over when last stage is done, nothing further happens', () => {
    let man = createManager(monsterrServer, [regularStage, timedStage])
    man.start()
    man.nextStage()
    man.nextStage()
    man.start() // extraneous start
    man.nextStage() // and nextStage
    expect(monsterrServer.send).toBeCalledWith('_game_over')
    expect(man.getCurrentStage()).toBe(2) // not reset
  })

  it('server-timed stage finishes after duration', (done) => {
    let man = createManager(monsterrServer, [timedStage])
    man.start()
    setTimeout(() => {
      expect(monsterrServer.send).toBeCalledWith('_start_stage', 0)
      expect(monsterrServer.send).toBeCalledWith('_end_stage', 0)
      done()
    }, 110)
  })

  it('server-timed stage can be terminated early', () => {
    let man = createManager(monsterrServer, [timedStage])
    man.start()
    man.nextStage()
    expect(monsterrServer.send).toBeCalledWith('_start_stage', 0)
    expect(monsterrServer.send).toBeCalledWith('_end_stage', 0)
  })

  it('client-timed stage can be terminated early', () => {
    let man = createManager(monsterrServer, [clientTimedStage]).setPlayerCount(2)
    man.start()
    man.nextStage()
    expect(monsterrServer.send).toBeCalledWith('_start_stage', 0)
    expect(monsterrServer.send).toBeCalledWith('_end_stage', 0)
  })

  it('client-timed stage terminates when all clients finished', (done) => {
    let man = createManager(monsterrServer, [clientTimedStage]).setPlayerCount(2)
    man.start()
    // Wait longer than stage duration to make sure it isnt terminated
    setTimeout(() => {
      expect(monsterrServer.send).not.toBeCalledWith('_end_stage', 0)
      // simulate the two players finishing
      man.playerFinishedStage(0)
      man.playerFinishedStage(0)
      expect(monsterrServer.send).toBeCalledWith('_end_stage', 0)
      done()
    }, 110)
  })

  it('client-timed stage terminates after 2xduration', (done) => {
    let man = createManager(monsterrServer, [clientTimedStage]).setPlayerCount(2)
    man.start()
    // Wait longer than stage duration to make sure it isnt terminated
    setTimeout(() => {
      expect(monsterrServer.send).not.toBeCalledWith('_end_stage', 0)
    }, 180)
    setTimeout(() => {
      expect(monsterrServer.send).toBeCalledWith('_end_stage', 0)
      done()
    }, 220)
  })
})
