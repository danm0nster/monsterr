# `monsterr` structure

## Client / Server
`monsterr` has a client compoment and a server compoent.

### Client (client.js)
On the client you configure options, define event and command handlers.

> Current:
```js
// client.js
import createClient from 'monsterr'

// optionally overwrite some default options/settings
let options = {
  ...
}
// optionally define event handlers
let events = {
  ...
}
// optionally define command handlers
let commands = {
  ...
}

// createClient creates the monsterr object with the specified parameters.
const monsterrClient = createClient({
  options,
  events,
  commands
})
```



### Server (server.js)
Server-side behaves similar to client.
> Current:
```js
//server.js
import createServer from 'monsterr'

// optionally overwrite some default options/settings
let options = {
  ...
}

// optionally define event handlers
let events = {
  ...
}
// optionally define command handlers
let commands = {
  ...
}

// createServer creates the server.
const monsterrServer = createServer({
  options,
  events,
  commands
})

// start the server
monsterrServer.run()
```

## What's the difference???
`monsterr` behaves different whether we are server-side or client-side.
By some black magic the exports available from `monsterr` differ from server to client, but both expose functionality that is common to client and server.

### Server Only
```
createServer (default)
Network
```

### Client Only
```
createClient (default)
```

### Both
```
Stages
```