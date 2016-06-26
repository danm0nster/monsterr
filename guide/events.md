# Events

## Client side
From the client you can only send events to the server. To do that use `monsterr.send`:
```js
monsterr.send('myEvent', {myData});
```
![send](/guide/images/send.png?raw=true "send")

## Server side responding to events
When receiving an event on the server you sometimes want to send something back. Sometimes only to the client who send the event. Sometimes to everyone. For these purposes each event handler will be passed a `client` object along with the event data. The client object contains methods for sending events and also the id of the client and the id of the group the client is part of.
```js
monsterr.events = {
  'myEvent': (client, data) => {
    client.id; // the clients own id
    client.groupId; // the id of the group the client is part of
  }
}

```

The possible options follows. Some have non-client specific equivalent alternatives. (see [Server side general](#server-side-general)) The equivalents are shown alongside the event specific.

### Send to client
Send event to the client who send the current event.
```js
...
client.send('otherEvent', {otherData}).to.client();
monsterr.send('otherEvent', {otherData}).to.client(client.id); // general
...
```
![toclient](/guide/images/toclient.png?raw=true "to.client")

### Send to all
Send event to all connected clients.
```js
...
client.send('otherEvent', {otherData}).to.all();
monsterr.send('otherEvent', {otherData}).to.all(); // general
...
```
![toall](/guide/images/toall.png?raw=true "to.all")

### Send to all - eXcept the client
Send event to all connected clients - except the client who send the current event.
```js
...
client.send('otherEvent', {otherData}).to.allX();
...
```
![toallX](/guide/images/toallX.png?raw=true "to.allX")

### Send to group
Send event to all clients in the same group as the client who send the current event.
```js
...
client.send('otherEvent', {otherData}).to.group();
monsterr.send('otherEvent', {otherData}).to.group(client.groupId); // general
...
```
![togroup](/guide/images/togroup.png?raw=true "to.group")

### Send to group - eXcept the client
Send event to all clients in the same group as the client who send the current event - except that client.
```js
...
client.send('otherEvent', {otherData}).to.groupX();
...
```
![togroupX](/guide/images/togroupX.png?raw=true "to.groupX")

## Server side general
Sometimes you want to send something from the server that isn't a direct response to a received event. In that case you use `monsterr`. You have three options or resolutions (*all, group, client*):

```js
monsterr.send('bigEvent', {data}).to.all();
monsterr.send('mediumEvent', {data}).to.group(/* group id */);
monsterr.send('smallEvent', {data}).to.client(/* client id */);
```
