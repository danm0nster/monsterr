# Commands
Using commands you can very simply support users issuing commands through the chat interface. Commands are very similar to events.

A command is issued by the user simply by prefacing their chat message with a **/**
```
/myCmd argument1 argument2
```

A command is first handled by the client if there is a matching *handler*. Should this handler return **false**, nothing further happens.

If there is no *handler* on the client OR the *handler* didn't return **false**, the command is automatically sent to the server where it executes any matching *handler*.

```js
// client side
let commands = {
  myCmd (monsterr, ...args) {
    ...
    // return false  <-- would stop the command from being sent to server as well
  }
}

// server side
let commands = {
  myCmd (monsterr, clientId, ...args) {
    ...
  }
}
```

## Example
Suppose you would like to let users add stuff like this: (why wouldn't you?)
```
/add 1 2 3
```

You could do it client side and write the result to the chat:
```js
// client.js
let commands = {
  add (monsterr, ...args) {
    let result = args.reduce((sum, arg) => sum + Number(arg), 0)
    // Display in chat
    monsterr.chat.append(result, 'Calculator')
    return false // Don't send command on to server
  }
}
```

Or you could do it server side and log the result:
```js
// server.js
let commands = {
  add (monsterr, clientId, ...args) {
    let result = args.reduce((sum, arg) => sum + Number(arg), 0)
    monsterr.log('added', { args, result })
  }
}
```

Or you could do both, simply by omitting the `return false` client side.

## Built-in commands


### Client
From the regular client you can issue the following commands:
- `/clear`: Clears the chat.
- `/id`: Prints clients id to chat.
- `/name [name]`: Names the client in chat (doesn't change id).

### Admin
From the admin client you can issue any of the regular client commands **PLUS** the following:
- `/start`: Will start the game (if not already started).
- `/next`: Will force game to next stage.
- `/reset`: Will end current stage and reset game.

In addition you can use the rather plain:
- `/players`: Writes a list of current players (ids) to admin chat.
- `/latencies`: Writes a stringified version of latency map to admin chat.

If you want to list players or their latencies more than for debugging now and then you will probably do well to implement an interface displaying these instead.
