/**
 * Builtin clientside events.
 */

export const builtinEvents = {
  _msg (monsterr, payload) {
    if (typeof payload === 'string') {
      monsterr.getChat().append(payload)
    } else {
      const { msg, name } = payload
      monsterr.getChat().append(msg, name)
    }
  }
}

export const builtinClientEvents = {
  _start_stage (monsterr, stageNo) {
    monsterr.getStageManager().startStage(stageNo)
  },
  _end_stage (monsterr, stageNo) {
    monsterr.getStageManager().endStage(stageNo)
  },
  _set_name (monsterr, { name, prevName }) {
    monsterr.getChat().rename(prevName, name)
  },
  _rename (monsterr, { name, prevName }) {
    monsterr.getChat().rename(prevName, name)
  }
}
