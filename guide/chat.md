# Chat

> Notice: Client only.

Provides easy access to the chat, without having to worry about html or css.

```js
let chat = monsterr.getChat() 
chat.clear()
chat.show()
chat.hide()
chat.toggle() // hide/show depending on current state

// Writing to chat:
chat.append('text', 'name')
// if 2nd argument is omitted 'System' is used as name.
chat.append('text')
```

You can specify that you want chat off by default by using the option **hideChat**:

```js
// client.js
createClient({
  options: {
    hideChat: true
  }
})
```
