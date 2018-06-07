# Events
The main way of communicating between the server and the client in *monsterr* is through events. Events have a **type** and a **payload**. The **type** is simply a string, whereas the **payload** should just be serializable. When *sending* events you use the helper `send(type, payload)` instead of supplying the raw event.

```js
// Samples:
send('eventIdentifier', 'myData')
/* {
  type: 'eventIdentifier',
  payload: 'myData'
} */

send('someEvent', { my: 'data' })
/* {
  type: 'someEvent',
  payload: { my: 'data' }
} */

send('123', {
  some: {
    more: {
      complex: 'data',
      with: 'numbers',
      too: 123
    }
  }
})
/* {
  type: '123',
  payload: {
    some: {
      more: {
        complex: 'data',
        with: 'numbers',
        too: 123
      }
    }
  }
} */
```

## Handling events
You define your event handlers and pass them to `createServer`/`createClient`.

### Client side
On the client side each event handler is simply passed the `monsterrClient` instance and the data of the event.
```js
let events = {
  myEvent (monsterrClient, data) {
    /* handle events of type 'myEvent' here */
  }
}

let monsterrClient = createClient({
  events
})
```

### Server side
Server-side events are also passed a *clientId*, but are otherwise handled exactly the same as on the client.

```js
let events = {
  myEvent (monsterrServer, clientId, data) {
    /* handle events of type 'myEvent' here */
  }
}

let monsterrServer = createServer({
  events
})
```

## Sending events
When sending events there are substantial differences depending on whether you are working client side or server side.

### Client side
From the client you can only send events to the server. To do that simply use `monsterr.send`:
```js
monsterr.send('type', payload)
```

### Server side
On the server you need to be specific about who to send the event to.

The possible methods follow here:

```js
monsterr.send('type', payload).toAll()
monsterr.send('type', payload).toClient(clientId)
monsterr.send('type', payload).toClients([clientId1, clientId2, ...])
monsterr.send('type', payload).toNeigboursOf(clientId) // includes client 'clientId'
monsterr.send('type', payload).toNeigboursOfExclusive(clientId)
monsterr.send('type', payload).toAdmin() // Send only to the special admin client
```

## Builtin Events
Internally `monsterr` uses events as well. These are prefixed to prevent clashes with your events. Sometimes you might want to provide your own event handlers for internal events.
> Note:
> It's important to note that you will **not** overwrite internal events. Your handlers will be run in addition to the internal logic.
> They will be called **after** internal event handlers are called.
> The order is: Internal > User defined > User defined (stage)

The internal events are exposed through `Events` available on client and server.

```js
import { Events } from 'monsterr'

// Example use:
let events = {
  [Events.CLIENT_CONNECTED] (monsterrServer, clientId) {
    // do something when client connects
  }
}
```

Heres a short description of each builtin event.
> (S) means its triggered on server, (C) on client, (SC) on both.

### Client lifecycle
Receives both `clientId` argument and `clientId` as **payload**.
- `Events.CLIENT_CONNECTED` (S): A new client connected.
- `Events.CLIENT_RECONNECTED` (S): A client reconnected before timing out.
- `Events.CLIENT_DISCONNECTED` (S): A client disconnected, possibly due to timing out.

### Stages lifecycle
These relate to the game progression.
- `Events.START_STAGE` (SC): A stage is starting. Receives `stageNo` as payload. The event tells a client to start the stage.
- `Events.END_STAGE` (SC): A stage is ending. Receives `stageNo` as payload. The event tells a client to end the stage.
- `Events.GAME_OVER` (SC): All stages have ended. Receives no payload. The event tells the client it's done.
- `Events.STAGE_FINISHED` (S): A client finished a stage (but other clients might not have yet). This event is only fired if stage is timed on client and when all client have reported 'finished' an `END_STAGE` will be fired. You would most likely do well to avoid this event as you can't rely on it always firing. Most likely what you want is the `END_STAGE`.

### Misc.
- `Events.LOG` (S): A client called `log()`. The event is simply used to do the logging serverside, but you can add to that behaviour.
- `Events.MESSAGE` (SC): A chat message. Payload is the message. This event is used to pass messages on to neighbours.