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
      .playerFinishedStage(clientId, stageNo)
  },

  [Events.CLIENT_CONNECTED] (monsterr, clientId) {
    console.log(clientId, 'connected!')
    monsterr.addPlayer(clientId)
  },

  [Events.CLIENT_RECONNECTED] (monsterr, clientId) {
    console.log(clientId, 'reconnected!')
    monsterr.addPlayer(clientId)
  },

  [Events.CLIENT_DISCONNECTED] (monsterr, clientId) {
    console.log(clientId, 'disconnected!')
    monsterr.removePlayer(clientId)
  },

  [Events.START_STAGE] (monsterr, _, stageNo) {
    monsterr.send(Events.START_STAGE, stageNo).toAll()
  },

  [Events.END_STAGE] (monsterr, _, stageNo) {
    monsterr.send(Events.END_STAGE, stageNo).toAll()
  },

  [Events.GAME_OVER] (monsterr) {
    monsterr.send(Events.GAME_OVER).toAll()
  }
}
