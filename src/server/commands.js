/**
 * Builtin serverside commands.
 */

export const builtinAdminCommands = {
  start (monsterr) {
    monsterr.start()
  },

  next (monsterr) {
    monsterr.getStageManager().next()
  },

  reset (monsterr) {
    monsterr.getStageManager().reset()
  },

  players (monsterr) {
    const players = monsterr.getNetwork().getPlayers().join(', ')
    monsterr
      .send('_msg', players)
      .toAdmin()
  },

  latencies (monsterr) {
    const latencies = JSON.stringify(monsterr.getLatencies())
    monsterr
      .send('_msg', latencies)
      .toAdmin()
  }
}
