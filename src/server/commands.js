/**
 * Builtin serverside commands.
 */

import * as Events from '../events'

export const builtinAdminCommands = {
  start (monsterr) {
    monsterr.start()
  },

  next (monsterr) {
    monsterr.nextStage()
  },

  reset (monsterr) {
    monsterr.reset()
  },

  players (monsterr) {
    const players = monsterr.getPlayers().join(', ')
    monsterr
      .send(Events.MESSAGE, players)
      .toAdmin()
  },

  latencies (monsterr) {
    const latencies = JSON.stringify(monsterr.getLatencies())
    monsterr
      .send(Events.MESSAGE, latencies)
      .toAdmin()
  }
}
