# Stages

A stage is a relatively isolatable part of a game and a game consists of a sequence of stages.

## Defining stages

A stage has the following basic structure:
```js
let stage = {
  serverSide: {
    ...
  },
  clientSide: {
    ...
  },
  options: {
    ...
  }
}
```

### Options
The following options are available:

- duration: Duration in ms. If specified the stage will automatically end after *duration*. This by default happens on the clients and the server makes the final call to move on to the next stage, when all connected clients have finished. If no duration is specified the stage will go on until all clients have finished or the server ends the stage early (You can do this with `monsterrServer.getStageManager().next()` if you need to).
- timeOnServer: By default a stage is timed on clients. You can use `timeOnServer: true` to change that. Then only the server will run a timer and will move on when that is done (no matter if clients report finished or not).

### ServerSide
Serverside you optionally provide any or all of the following:
```js
serverSide: {
  events: { ... },
  commands: { ... },
  setup: (monsterrServer) => {
    ...
  },
  teardown: (monsterrServer) => {
    ...
  }
}
```

*events* and *commands* work just like regularly with the exception that they are only valid (that is, executed) for the duration of the stage to which they belong.
*setup* is called when the stage begins.
*teardown* is called when the stage ends.

### ClientSide
Clientside is exactly like serverside except you get an instance of `monsterrClient` instead of `monsterrServer`:
```js
clientSide: {
  events: { ... },
  commands: { ... },
  setup: (monsterrClient) => {
    ...
  },
  teardown: (monsterrClient) => {
    ...
  }
}
```


## Sequence
To use your stages you need to build the sequence of stages that is to be your game.
The recommended way of structuring your stages is (but you can of course structure them any way you like):
```
.
|____client.js
|____server.js
|____src
| |____stages
| | |____index.js     // Sequence your stages here
| | |____stage1
| | | |____index.js   // Combine client/server for stage1 here
| | | |____client.js
| | | |____server.js
| | |____stage2
| | | |____index.js   // Combine client/server for stage2 here
| | | |____client.js
| | | |____server.js
```

The *stages/index.js* might then look like this:
```js
import stage1 from './stage1'
import stage2 from './stage2'

export default [
  stage1,
  stage2
]
```

To actually include stages in your game you have to pass them to **both** `createClient` and `createServer`.

```js
// server.js
import stages from './src/stages'
...
createServer({
  ...,
  stages
})

// client.js
import stages from './src/stages'
...
createClient({
  ...,
  stages
})
```

## Sequence helpers
`monsterr` includes a few helpers for use when defining your sequence of stages.

They are `repeat` (repeats a stage), `withDuration` (sets the duration option) and `timeOnServer` (sets the timeOnServer option).

Let's revisit *stages/index*, this time with some helpers:
```js
import { Stages } from 'monsterr'

import stage1 from './stage1'
import stage2 from './stage2'

export default [
  Stages.repeat(stage1, 10),
  Stages.withDuration(stage2, 10000),
  Stages.timeOnServer(stage1)
]
```