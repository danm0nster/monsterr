# Commands
Using commands you can very simply support users issuing commands through the chat interface.

A command is issued by the user simply by prefacing their chat message with a **/**
```
/myCmd argument1 argument2
```
Commands work exactly like events except you don't have to do anything to have them sent. You just need to handle them and you do that just like you would handle events. The command is automatically sent to the server as well, but you can stop that by returning false in your 'command handler'.

```js
// client side
let commands = {
  'myCmd': function (monsterr, ...args) {
    // return false;  <-- would stop the command from being sent to server as well
  }
}
// server side
let commands = {
  'myCmd': function (monsterr, client, ...args) {
    // client is the same client object you'd get in event handlers
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
  'add': function(monsterr, ...args) {
    var result = args.reduce(function(sum, arg) {
      return sum + parseInt(arg);
    }, 0);
    monsterr.chat.prepend(result); // Display in chat
    return false; // Don't send command on to server
  }
}
```

Or you could do it server side and log the result:
```js
// server.js
let commands = {
  'add': function(monsterr, client, ...args) {
    var result = args.reduce(function(sum, arg) {
      return sum + parseInt(arg);
    }, 0);
    monsterr.log('added', {args: args, result: result});
  }
}
```

Or you could do both, simply by omitting the `return false;` client side.

## Built-in commands
### clear
*monsterr* comes with the command **clear** built-in. If a user types `/clear` in their chat it will clear the chat window. This can be overwritten simply by supplying another command handler client side.
