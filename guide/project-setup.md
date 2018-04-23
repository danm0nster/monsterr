# `monsterr` structure

## Client / Server
`monsterr` has a client compoment and a server compoent.

### Client (client.js)
On the client you configure options, define event and command handlers.

> Current:
```js
// client.js
import { createClient } from 'monsterr'

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
import { createServer } from 'monsterr'

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

### So what's the difference???

**TODO**

#### Canvas
The canvas is of course only available on the client.

#### Options
The options available on server and client are quite different as you might expect. For example there are options regarding network on the server side, whereas on the client side there are options regarding the UI.
