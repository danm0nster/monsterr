/**
 * Built in serverside events.
 */

export const builtinEvents = {
  _set_name (monsterr, clientId, name) {
    monsterr.setName(clientId, name)
  },

  _msg (monsterr, clientId, msg) {
    monsterr
      .send('_msg', { msg, name: monsterr.getName(clientId) })
      .toNeighboursOf(clientId)
  },

  _log (monsterr, _, json) {
    monsterr.log(json.msg, json.fileOrExtra, json.extra)
  },

  _stage_finished (monsterr, clientId, stageNo) {
    monsterr
      .getStageManager()
      .playerFinishedStage(clientId, stageNo)
  }
}
