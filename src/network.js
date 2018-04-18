const uniq = require('lodash/uniq')

/**
 * @typedef {number[][]} adjList
 */

/**
 * Returns the first empty (undefined) index in an array or -1 if no empty indexes exist.
 * @param {*[]} array the array to check
 * @returns {number}
 */
function firstEmptyIndex (array) {
  return array.reduce((prev, elem, index) => {
    if (prev !== -1) {
      return prev
    }

    return elem === undefined ? index : -1
  }, -1)
}

/**
 * Returns an adjecency list representing the same network layout as the matrix.
 * @param {adjList} matrix The matrix to convert.
 * @returns {adjList}
 */
function matrixToList (matrix) {
  return matrix.map((row, rowIndex) =>
    row
      .map((e, i) => e !== 0 ? i : -1)
      .filter((elem, colIndex) =>
        elem !== -1 && colIndex !== rowIndex
      )
  )
}

/**
 * Returns a network.
 * @param {adjList} adjList an adjecency list defining a network layout
 */
function network (adjList) {
  // remove dupes
  adjList = adjList.map(uniq)

  let players = []
  let playerToIndex = {}

  return {
    addPlayer (player) {
      let nextIndex = firstEmptyIndex(players)
      if (nextIndex !== -1) {
        playerToIndex[player] = nextIndex
        players[nextIndex] = player
      } else {
        playerToIndex[player] = players.length
        players.push(player)
      }
    },

    removePlayer (player) {
      let index = playerToIndex[player]
      playerToIndex[player] = undefined
      players[index] = undefined
    },

    getPlayerIndex (player) {
      let index = playerToIndex[player]
      return index === undefined ? -1 : index
    },

    getPlayers () {
      return players
    },

    getNeighbours (player) {
      let index = playerToIndex[player]
      if (index === undefined) {
        return [] // player not in network
      }

      return adjList[index].map(i => players[i]).filter(e => e !== undefined)
    }
  }
}

module.exports = {
  matrixToList,

  /**
   * @param {adjList} list
   */
  fromAdjecencyList (list) {
    return network(list)
  },

  /**
   * @param {adjList} matrix
   */
  fromAdjecencyMatrix (matrix) {
    let adjList = matrixToList(matrix)
    return this.fromAdjecencyList(adjList)
  },

  /* standard networks */
  /**
   * @param {number} playerCount
   */
  solo (playerCount) {
    return this.groups(playerCount, 1)
  },

  /**
   * @param {number} playerCount
   */
  pairs (playerCount) {
    return this.groups(playerCount, 2)
  },

  /**
   * @param {number} playerCount
   */
  clique (playerCount) {
    return this.groups(playerCount, playerCount)
  },

  /**
   * @param {number} playerCount
   * @param {number} groupSize
   */
  groups (playerCount, groupSize) {
    let adjList = []
    for (let i = 0; i < playerCount; i) {
      // create the group
      let group = []
      for (let j = i; j < i + groupSize; j++) {
        group.push(j)
      }

      // and filter out players themselves
      for (let k = i; k < i + groupSize; k++) {
        adjList.push(group.filter(n => n !== k))
      }

      // go to next group
      i += groupSize
    }
    return network(adjList)
  },

  /**
   * @param {number} playerCount
   * @param {number} noOfNeighbours
   */
  circular (playerCount, noOfNeighbours) {
    let adjList = []
    for (let i = 0; i < playerCount; i++) {
      let neighbours = []
      for (let j = i - noOfNeighbours; j <= i + noOfNeighbours; j++) {
        if (j === i) { continue }

        if (j < 0) {
          neighbours.push(playerCount + j)
        } else if (j >= playerCount) {
          neighbours.push(j - playerCount)
        } else {
          neighbours.push(j)
        }
      }
      adjList.push(neighbours)
    }

    return network(adjList)
  }
}
