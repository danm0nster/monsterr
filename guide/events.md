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

There are two things you can do with events. You can send them. And you can respond to them. That goes for server as well as client.

## Handling events
You define your event handlers (or simply events) and pass them to `createServer`/`createClient`.

### Client side
On the client side each event handler is simply passed the data of the event.
```js
let events = {
  'myEvent': (monsterr, data) => {
    ...
  }
}

let monsterrClient = createClient({
  events
})
```

### Server side
On the server side each event handler is also passed a reference to the `monsterr` object and a special `client` object representing the client from whom the event originates. See below on how to use this.
```js
let events = {
  'myEvent': (monsterr, client, data) => {
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
monsterr.send('event', data);
```

### Server side
On the server you need to be specific about who to send the event to.

When receiving an event on the server you probably often want to send something back to the client who send the event. Or maybe let everyone know what happened. For these purposes each event handler will be passed a `client` object along with the event data. The client object contains methods for sending events and also the id of the client.
```js
let events = {
  'myEvent': (monsterr, client, data) => {
    client.id; // the clients id
  }u
}

```

The possible methods follow here:

```js
// to originating client only
client.send('event', data).toClient()
monsterr.send('event', data).toClient(client.id) // functionally equivalent

// to all except client
client.send('event', data).toAllExceptClient()

// to neighbours of client (including client)
client.send('event', data).toNeighbours()

// to neighbours of client (excluding client)
client.send('event', data).toNeighboursExceptClient()
```


### General
Sometimes you might want to send something from the server that isn't a direct response to a received event. In that case you can use the `monsterr.send` methods also explained above. You have the two possible options (*all, client*):

```js
monsterr.send('bigEvent', data).toAll()
monsterr.send('smallEvent', data).toClient('clientId')
```
