# monsterr
Node.js based framework for socioeconomic experiments.

## Installation
Install using Node.js:

```
npm install monsterr --save
```

## What is monsterr?
To use monsterr it's best to first understand how it's structured and what it does.

A monsterr application has two main parts. A **server** and a **client**. For each part there is a *monsterr* object with multiple components. Some are available on the server *and* the client, some are only available on one. Here's a list of all the components.

- *Core modules (available on both server and client)*
  - Logger
  - Events
- *Server only*
  - Network
- *Client only*
  - Chat
  - Canvas
  - Fabric

### Server
The server needs to do a couple of things. It is the actual server and as such it will need to be started and set up with a port number.
On the server you can also implement custom logic and events.

### Client
The client is *served by the server*. It automatically runs when the a client connects to the server. The client can among other things be set up to use a static canvas or a dynamic one.

## Usage
TODO

## Example
The simplest possible monsterr application:
### server.js
```js
var monsterr = require('monsterr')();

monsterr.run(80);
```

### client.js
```js
monsterr.run();
```
