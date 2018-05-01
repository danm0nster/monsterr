# Chat

> Notice: Client only.

On the client you get access to the `chat` object, simply accessed with `monsterr.getChat()`. This object will provide easy access to the chat, without having to worry about html or css.


```js
let chat = monsterr.getChat() 
chat.prepend('text'); // inserts 'text' at the top of the chat
chat.clear(); // clears the chat
```
