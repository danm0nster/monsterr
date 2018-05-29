/**
 * Builtin clientside commands.
 */

export const builtinCommands = {
  clear (monsterr, ...args) {
    monsterr.getChat().clear()
    return false // don't send this
  },
  id (monsterr) {
    monsterr.getChat().append(monsterr.getId())
  },
  name (monsterr, name) {
    monsterr.send('_set_name', name)
  }
}
