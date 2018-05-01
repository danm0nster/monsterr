# Events
The main way of communicating between the server and the client in *monsterr* is through events. Events have an identifier and some data. The identifier is simply a string, whereas the data can be either a string, or a JSON object for more complex events.
```js
// Sample identifiers:
'eventIdentifier'
'someEvent'
'123'
// Sample data:
'myData'
{my: 'data'}
{some: {more: {complex: 'data', with: 'numbers', too: 123}}}
```

There are two things you can do with events. You can send them. And you can respond to them. That goes for the server as well as client.

## Handling events
You define your event handlers (or simply events) and pass them to `createServer`/`createClient`.

### Client side
On the client side each event handler is simply passed the `monsterrClient` instance and the data of the event.
```js
let events = {
  'myEvent': (monsterrClient, data) => {
    ...
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
  'myEvent': (monsterrServer, clientId, data) => {
    ...
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
monsterr.send('event', data)
```

### Server side
On the server you need to be specific about who to send the event to.

The possible methods follow here:

```js
monsterr.send('event', data).toAll()
monsterr.send('event', data).toClient(clientId)
monsterr.send('event', data).toClients([clientId1, clientId2, ...])
monsterr.send('event', data).toNeigboursOf(clientId) // includes client 'clientId'
monsterr.send('event', data).toNeigboursOfExclusive(clientId)
monsterr.send('event', data).toAdmin() // Send only to the special admin client
```