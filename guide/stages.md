# Stages
> `create-monsterr-game` includes a sample stage. It might be easier to follow the sample than the documentation alone.

A stage is a relatively isolatable part of a game and a game consists of a sequence of stages.

## Structure
Stages are usually structured like this:
```
|____ src
| |____stages
| | |____stage1
| | | |____client.js
| | | |____server.js
| | | |____stage1.html
| | | |____stage1.css
| | |____stage2
| | |____stage3
```


## Defining stages
A stage has a client component and a server component both of which has the following basic structure:
```js
let stage = {
  events: {
    ...
  },
  commands: {
    ...
  },
  options: {
    ... // options vary from server to client
  },
  setup () {},
  teardown () {},
  html // CLIENT ONLY
}
```

### Options
The following options are available:

- duration: Duration in ms. If specified the stage will automatically end after *duration*. This can be done both on the server (force end after duration) or on the client (wait for all clients to finish before ending).

### Events / Commands
Events and commands work like regular events and commands except they are 'scoped' to the stage. They will only execute during the stage.

### Setup / Teardown
You can provide a setup and/or teardown handler both on the server and on the client. These will run when the stage starts/ends. They receive the `monsterrServer` or `monsterrClient` instance as their only argument.

```js
{
  setup (monsterrServer /* or client */) {
    ...
  },
  teardown (monsterrServer /* or client */) {
    ...
  }
}
```


## Sequence
To use your stages you need to build the sequence of stages that is to be your game. You have to do this for the server and for the client.

The *server.js* might have this:
```js
import stage1 from './stage1/server'
import stage2 from './stage2/server'

const stages = [
  stage1,
  stage2
]

createServer({
  stages,
  ...
})
```

And the *client.js* should then have this:
```js
import stage1 from './stage1/client'
import stage2 from './stage2/client'

/* Notice, same sequence as server */
const stages = [
  stage1,
  stage2
]

createClient({
  stages,
  ...
})
```

## Sequence helpers
`monsterr` includes a few helpers for use when defining your sequence of stages.

They are `repeat` (repeats a stage), `withDuration` (sets the duration option).

They can be used as follow:
```js
// server.js
import { Stages } from 'monsterr'

import stage1 from './stage1/server'
import stage2 from './stage2/server'

const stages = [
  Stages.repeat(stage1, 10), // repeat a stage
  Stages.withDuration(stage2, 10000), // use stage but with different duration
]
```

## Example
Heres a real-world example stage setup utilizing both `repeat` and `withDuration`:
```js
/* imports... */

const stages = [
  introStage,
  quizStage,
  Stages.repeat([
    Stages.withDuration(gameStage, settings.GAME_DURATION),
    resultStage
  ], settings.GAME_ROUNDS)
]
```
> Note the use of a nested sequence of stages within `repeat`.

# Html Container

It is possible to add HTML to your stages. This can be useful if you have to present something better structured as HTML or if you want to take some inputs from the user.

You can create html files within your existing stage structure: ex.

```html
<!-- .../stage1/stage1.html -->
<div id="myDiv">
  <h1>Hi!</h1>
</div>
```
And include it in your *client.js* for the stage.

```js
// .../stage1/client.js
import html from './stage1.html'

export default {
  html, // <== make sure to include html here
  options: {
    // You can set the height of the html content
    // for this stage only. After the stage the height
    // will revert to default. See below.
    htmlContainerHeight: 0.5
  },
  ...
}
```

In your client you can use jQuery (or native DOM) to access and/or manipulate the html.

```js
// .../stage1/client.js
...
$('#myDiv').html() // get contents
$('#myDiv').html('overwrite contents')
```

## htmlContainerHeight
`htmlContainerHeight` defines the height of the html content. It is specified as a ratio of screen height.
By default `htmlContainerHeight` will be `0.3` (30% of height).

- `htmlContainerHeight = 0`: htmlContent is completely hidden.
- `htmlContainerHeight = 1`: htmlContent fills entire height (canvas will be hidden).

You can change the height per stage as mentioned above or you can set a different default when creating your client.

```js
// client.js
...createClient({
  options: {
    htmlContainerHeight: 0 // hide html by default
  }
})
```