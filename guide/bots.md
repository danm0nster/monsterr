# Bots

It's possible to write bots to participate in `monsterr` games. Bots connect with websocket and will be treated like regular clients by the game.

## Requirements
You can write bots in any language with a websocket client.

`create-monsterr-game` includes a barebones example of a bot written in JS.

### How to
When writing a bot you basically *JUST* receive events and send events. That's it. You can of course use any events you define yourself, but you also want to use some builtin events. Because the interface is so low-level you will not have the standard events available as exposed constants (unless in JS where you could import them).

Therefore we include a list of the builtin events here:

### Builtin events
**Client lifecycle**
```
'@monsterr/CLIENT_CONNECTED'
'@monsterr/CLIENT_RECONNECTED'
'@monsterr/CLIENT_DISCONNECTED'
```

**Game lifecycle**
```
'@monsterr/START_STAGE'
'@monsterr/END_STAGE'
'@monsterr/STAGE_FINISHED'
'@monsterr/GAME_OVER'
```

**Misc.**
```
'@monsterr/LOG' // client logs something
'@monsterr/MESSAGE' // client sends message
```


## Example (JS)
Here's a simple bot, but see `create-monsterr-game` for more info.
```
/**
 * Bot interface.
 * 
 * Handle events to implement functionality.
 */

const io = require('socket.io-client')
const socket = io('http://localhost:3000/clients').connect()

socket.on('connect', () => console.log('connected'))
socket.on('disconnect', () => console.log('disconnected'))
socket.on('error', err => console.log(err))
socket.on('event', /* Handle events */)

// Events are of shape:
{
  type: String,
  payload: any
}

// ex. (start stage 2)
{
  type: '@monsterr/START_STAGE',
  payload: 2
}
```