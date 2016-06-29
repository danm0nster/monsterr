# Chat
On the client you get access to the `chat` object, simply accessed with `monsterr.chat`. This object will provide easy access to the chat, without having to worry about html or css.

## Methods
```js
chat.prepend('text'); // inserts 'text' at the top of the chat
chat.clear(); // clears the chat
```

## Options
The available chat related options (and their defaults) are:
```js
options = {
  chatHeight: 200 // the height of the chat (in pixels)
}
```
