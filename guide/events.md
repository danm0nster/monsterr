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
You define your event handlers (or simply events) before running *monsterr*. It is important that you do it before calling `monsterr.run` as that will connect the event handlers you define to the actual events happening. It is done by assigning to `monsterr.events` and simply providing an identifier and a event handler for each event you want to catch.
```js
...
monsterr.events = {
  'myEvent': function {
    // do something cool here
  }
}
...
monsterr.run();
```

### Client side
On the client side each event handler is simply passed the data of the event.
```js
...
'myEvent': (data) => {
  ...
},
...
```

### Server side
On the server side each event handler is also passed a reference to the client from whom the event originates. See below on how to use this.
```js
...
'myEvent': (client, data) => {
  ...
},
...
```

## Sending events
When sending events there are substantial differences depending on whether you are working client side or server side.

### Client side
From the client you can only send events to the server. To do that simply use `monsterr.send`:
```js
monsterr.send('myEvent', {myData});
```
![send](/guide/images/send.png?raw=true "send")

### Server side
On the server you need to be specific about who to send the event to.

When receiving an event on the server you probably often want to send something back to the client who send the event. Or maybe let everyone know what happened. For these purposes each event handler will be passed a `client` object along with the event data. The client object contains methods for sending events and also the id of the client and the id of the group the client is part of.
```js
monsterr.events = {
  'myEvent': (client, data) => {
    client.id; // the clients own id
    client.groupId; // the id of the group the client is part of
  }
}

```

The possible methods follows. Some of the methods have a more general alternative. The alternatives are shown alongside the event specific.

#### Send to client
Send event to the client who send the current event. Using the `client` object you need not worry about client IDs or anything. It is possible to use the general method through the `monsterr` object, but then you also need to supply the client ID.
```js
...
client.send('otherEvent', {otherData}).to.client();
monsterr.send('otherEvent', {otherData}).to.client(client.id); // general - equivalent
...
```
![toclient](/guide/images/toclient.png?raw=true "to.client")

#### Send to all
Send event to all connected clients. The two methods are equivalent and none rely on extra information. Both are provided solely for completeness.
```js
...
client.send('otherEvent', {otherData}).to.all();
monsterr.send('otherEvent', {otherData}).to.all(); // general
...
```
![toall](/guide/images/toall.png?raw=true "to.all")

#### Send to all - eXcept the client
Send event to all connected clients - except the client who send the current event. This can only be used through the `client` object as it's specific to the current event.
```js
...
client.send('otherEvent', {otherData}).to.allX();
...
```
![toallX](/guide/images/toallX.png?raw=true "to.allX")

#### Send to group
Send event to all clients in the same group as the client who send the current event. Again, these are equivalent, but using the `client` version you need not worry about group IDs.
```js
...
client.send('otherEvent', {otherData}).to.group();
monsterr.send('otherEvent', {otherData}).to.group(client.groupId); // general - equivalent
...
```
![togroup](/guide/images/togroup.png?raw=true "to.group")

#### Send to group - eXcept the client
Send event to all clients in the same group as the client who send the current event - except that client. This can only be used through the `client` object as it's specific to the current event.
```js
...
client.send('otherEvent', {otherData}).to.groupX();
...
```
![togroupX](/guide/images/togroupX.png?raw=true "to.groupX")

### General
Sometimes you might want to send something from the server that isn't a direct response to a received event. In that case you can use the `monsterr.send` methods also explained above. You have the three options or possible resolutions (*all, group, client*):

```js
monsterr.send('bigEvent', {data}).to.all();
monsterr.send('mediumEvent', {data}).to.group(/* group id */);
monsterr.send('smallEvent', {data}).to.client(/* client id */);
```

To use the two last ones, you of course need to know the group and/or client IDs.
