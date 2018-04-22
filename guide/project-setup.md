# `monsterr` structure

## Client / Server
`monsterr` has a client compoment and a server compoent.

### Client (client.js)
On the client you configure options, define event and command handlers. Calling `monsterr.run()`, *monsterr* will tie it all together for you.

> Current:
```js
// client.js
import { Client } from 'monsterr'

const monsterr = Client()

// optionally overwrite some default options/settings
monsterr.options = {
  ...
}
// optionally define event handlers
monsterr.events = {
  ...
}
// optionally define command handlers
monsterr.commands = {
  ...
}
// start it
monsterr.run()
```

> Proposal:
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

// start it
// Proposal is that the client won't have a run method and that createClient will do all the necessary work instead.
// monsterr.run()
```



### Server (server.js)
Server-side behaves similar to client.
> Current:
```js
//server.js
import { Server } from 'monsterr'

// optionally overwrite some default options/settings
monsterr.options = {
  ...
}
// optionally define event handlers
monsterr.events = {
  ...
}
// optionally define command handlers
monsterr.commands = {
  ...
}
// start it
monsterr.run()
```

> Proposal:
```js
//server.js
import { createServer } from 'monsterr'

// optionally overwrite some default options/settings
let options = {
  ...

// optionally define event handlers
let events = {
  ...
}
// optionally define command handlers
commands = {
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
