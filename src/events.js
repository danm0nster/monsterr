/**
 * Client 'lifecycle'. Fired on connects/reconnects/disconnects.
 */
export const CLIENT_CONNECTED = '@monsterr/CLIENT_CONNECTED'
export const CLIENT_RECONNECTED = '@monsterr/CLIENT_RECONNECTED'
export const CLIENT_DISCONNECTED = '@monsterr/CLIENT_DISCONNECTED'

/**
 * Stage/Game 'lifecycle'.
 *
 * START_STAGE: Server notifies client to start a stage.
 * END_STAGE: Server notifies client to end a stage.
 * STAGE_FINISHED: Client notifies server that it has finished
 *  a stage. This is only used when stage is timed on clients.
 * GAME_OVER: Server notifies client whn the last stage has ended.
 */
export const START_STAGE = '@monsterr/START_STAGE'
export const END_STAGE = '@monsterr/END_STAGE'
export const STAGE_FINISHED = '@monsterr/STAGE_FINISHED'
export const GAME_OVER = '@monsterr/GAME_OVER'

/**
 * Misc.
 */
export const SET_ID = '@monsterr/SET_ID' // notify client of new id
export const SET_NAME = '@monsterr/SET_NAME' // change client name
export const RENAME = '@monsterr/RENAME' // notify others of client name change
export const HEARTBEAT = '@monsterr/HEARTBEAT'
export const HEARTBEAT_ACK = '@monsterr/HEARTBEAT_ACK'
export const LOG = '@monsterr/LOG' // client logs something
export const MESSAGE = '@monsterr/MESSAGE' // client sends message

/* Public api */
export default {
  CLIENT_CONNECTED,
  CLIENT_RECONNECTED,
  CLIENT_DISCONNECTED,

  START_STAGE,
  END_STAGE,
  STAGE_FINISHED,
  GAME_OVER,

  LOG,
  MESSAGE
}
