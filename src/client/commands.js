/**
 * Builtin clientside commands.
 */

import * as Events from '../events'

export const builtinCommands = {
  clear (monsterr, ...args) {
    monsterr.getChat().clear()
    return false // don't send this
  },
  id (monsterr) {
    monsterr.getChat().append(monsterr.getId())
  },
  name (monsterr, name) {
    monsterr.send(Events.SET_NAME, name)
  }
}
