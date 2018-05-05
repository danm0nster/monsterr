# Chat

> Notice: Client only.

Provides easy access to the chat, without having to worry about html or css.

```js
let chat = monsterr.getChat() 
chat.append('text')
chat.clear()
chat.show()
chat.hide()
chat.toggle() // hide/show depending on current state
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
