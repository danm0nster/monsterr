# Network
> Notice: Network is only exposed server-side. It should only be used to set up the server.

Every `monsterr` game uses a network to define how clients are connected to each other. Each node in the network represents a client.

You can access the default configured network through `monsterr.network`. From the network you can retrieve players or get neighbours of a certain player.

```js
let network = monsterr.getNetwork()
let allPlayers = network.getPlayers()
let neighbours = network.getNeighbours(allPlayers[0]) // returns array of neigbours of first player
```

By default `monsterr` is configured with `Network.pairs(16)`. You can use any other configuration you like.

```js
import { Network } from 'monsterr'

// Using matrix
let myNetwork = Network.fromAdjecencyMatrix([
  [1, 1, 0, 0],
  [1, 1, 0, 1],
  [0, 0, 1, 0],
  [0, 1, 0, 1]
])

// Using list (equivalent network configuration)
let myNetwork = Network.fromAdjecencyList([
  [1],
  [0, 3],
  [],
  [1]
])

// Using defaults (these all require a playerCount, ex: 6)
let myNetwork = Network.circular(6, 2) // playerCount, noOfNeighbours
let myNetwork = Network.groups(6, 2) // playerCount, groupSize
let myNetwork = Network.clique(6) // playerCount
let myNetwork = Network.pairs(6) // playerCount
let myNetwork = Network.solo(6) // playerCount

// make the server use it
const monsterrServer = createServer({
  network: myNetwork 
})
```

*Notice that it is perfectly possible to use an asymmetrical adjecency matrix or list which means that **directed graphs are supported just the same as undirected**.*

```js
// directed one-way circular graph
let myNetwork = Network.fromAdjecencyList([
  [1],
  [2],
  [3],
  [4],
  [0]
])
```

## Proposal (THIS IS NOT IMPLEMENTED)

The current implementation only allows for a set number of clients. I propose supporting a variable number of clients. The way I would approach that is using a `grow` function that specifies how a network grows.

```js
let myNetwork = Network.fromAdjecencyList(
  [], // some initial network configuration (adjecency list)
  (adjList) => {
    // Optional function that takes in the current adjList and returns a new larger one. This defines how the network grows.
    // It is automatically called when needed.

    // Example: add one unconnected node
    return [
      ...adjList,
      [] // next node will have no neighbours
    ]

    // Example: add a node that is connected to to the prev one and a random one beside that
    let randomNode = Math.floor(Math.random() * adjList.length - 1)
    return [
      ...adjList,
      [adjList.length - 1, randomNode]
    ]

    // Example: add multiple nodes
    return [
      ...adjList,
      [],
      [],
      []
    ]

    // Example: add a new node, but make all current ones connect to it
    let newNode = adjList.length
    return [
      ...adjList.map(neighbours => [...neighbours, newNode]),
      []
    ]
  }
)
```

It should be possible to define the default network types using initial adjLists and `grow` functions. That way they could simply be used as:
```js
let myNetwork = Network.circular(2) // noOfNeighbours
let myNetwork = Network.groups(2) // groupSize
let myNetwork = Network.clique()
let myNetwork = Network.pairs()
let myNetwork = Network.solo()
```

This might be paired with a `maxPlayers` optional setting/option that allows us to define an absolute maximum.

As an example `pairs` could be implemented similar to this:
```js
let pairsNetwork = Network.fromAdjecencyList(
  // start off with one pair
  [
    [1],
    [0]
  ], 
  // add a new separate pair when growing
  (adjList) => {
    let lastElement = adjList.length - 1

    return [
      ...adjList,
      [lastElement + 2], 
      [lastElement + 1]
    ]
  }
)
```