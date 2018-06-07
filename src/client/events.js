/**
 * Builtin clientside events.
 */

import * as Events from '../events'

export const builtinEvents = {
  [Events.MESSAGE] (monsterr, payload) {
    if (typeof payload === 'string') {
      monsterr.getChat().append(payload)
    } else {
      const { msg, name, sender } = payload
      monsterr.getChat().append(msg, name, sender === monsterr.getId())
    }
  }
}

export const builtinClientEvents = {
  [Events.START_STAGE] (monsterr, stageNo) {
    monsterr.getStageManager().startStage(stageNo)
  },
  [Events.END_STAGE] (monsterr, stageNo) {
    monsterr.getStageManager().endStage(stageNo)
  },
  [Events.SET_NAME] (monsterr, { name, prevName }) {
    monsterr.getChat().rename(prevName, name)
  },
  [Events.RENAME] (monsterr, { name, prevName }) {
    monsterr.getChat().rename(prevName, name)
  }
}
