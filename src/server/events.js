/**
 * Built in serverside events.
 */

import * as Events from '../events'

export const builtinEvents = {
  [Events.SET_NAME] (monsterr, clientId, name) {
    monsterr.setName(clientId, name)
  },

  [Events.MESSAGE] (monsterr, clientId, msg) {
    monsterr
      .send(Events.MESSAGE, { msg, name: monsterr.getName(clientId) })
      .toNeighboursOf(clientId)
  },

  [Events.LOG] (monsterr, _, json) {
    monsterr.log(json.msg, json.fileOrExtra, json.extra)
  },

  [Events.STAGE_FINISHED] (monsterr, clientId, stageNo) {
    monsterr
      .getStageManager()
      .playerFinishedStage(clientId, stageNo)
  }
}
