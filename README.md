# monsterr
Description coming.

# Installation
Install using `npm`:

```
npm install monsterr --save
```

# Usage


## Events
Events are available on the server and on the client. You simply define events as functions that will get called when that event occurs. You can also `emit` events.

#### server.js
```js
var monsterr = require('monsterr')();  //  instantiate server

// define custom events
monsterr.events = {
  'myEvent': () => {
    // do something cool
    monsterr.emit('responseEvent', {something: 'cool'}); // and send something to clients
  }
};

monsterr.run(80); // run the server on port 80 (HTTP)
```

#### client.js
```js
// monsterr object available as is
// define custom events
monsterr.events = {
  'responseEvent': (data) => {
    alert(data.something); // alerts 'cool'
  }
};

// run it
monsterr.run();
```

### Internal events
Internally monsterr also uses events for communication. It is possible to hook onto these events or even override them.
The events used internally are:
- `message`
- `connect`
- `disconnect`

#### Hook (server or client)
You hook onto an event simply by defining an event with the same identifier.
```js
monsterr.events = {
  'message': (msg) => {
    console.log('someone said ' + msg);
  }
};
```
This event will run alongside the ones used internally. monsterr provides no assurances as to the order in which the events are run.

#### Override (server or client)
You can even override events. We do not suggest that you do this as it might interfere with monsterr's standard features and performance, but it is possible and who knows. Maybe you have a good reason to do so.
```js
monster._events['message'] = () => { // override the internal event 'message' (notice the _ prefacing events)
  // do something different
}
monster._events['message'] = () => {}); // or just get rid of it by providing an empty function
```

## Logger
TODO

## Canvas and Fabric
TODO

## Chat
TODO

## Network
On the server side you can access the `network` object with `monsterr.network`. On the client side you have no access to the underlying network. But you can tag messages for general comsumption or on a group basis. See Groups.

Using the `network` object you can do a couple of things.
Before running the server you can specify a desired group size. monsterr will automatically fill users into separated groups of that size. During execution you can either shuffle the network (which will shuffle the users into new constellations) or you can specify a new group size which will also force a shuffle.

You can check whether or not the network is balanced (each group is full).

You can balance the network. This is essentially equivalent to shuffle, but semantically slightly different.
