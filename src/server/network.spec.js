/* globals describe it expect */
const Network = require('./network')

let threeNodeGraph = [
  [1, 2],
  [0],
  [0]
]
let threeNodeGraphAsMatrix = [
  [1, 1, 1],
  [1, 1, 0],
  [1, 0, 1]
]

describe('network', () => {
  it('new network should be empty', () => {
    let network = Network.fromAdjecencyList(threeNodeGraph)
    expect(network.getPlayers().length).toEqual(0)
  })

  it('new members should be added in order', () => {
    let network = Network.fromAdjecencyList(threeNodeGraph)
    network.addPlayer('John')
    network.addPlayer('Jane')
    network.addPlayer('Will')
    expect(network.getPlayers()).toEqual(['John', 'Jane', 'Will'])
  })

  it('should be able to retrieve players index', () => {
    let network = Network.fromAdjecencyList(threeNodeGraph)
    network.addPlayer('John')
    network.addPlayer('Jane')
    expect(network.getPlayerIndex('John')).toEqual(0)
    expect(network.getPlayerIndex('Jane')).toEqual(1)
    expect(network.getPlayerIndex('Will')).toEqual(-1)
  })

  // TODO
  it('removing a member should leave a spot in player list', () => {
    let network = Network.fromAdjecencyList(threeNodeGraph)
    network.addPlayer('John')
    network.addPlayer('Jane')
    network.addPlayer('Will')
    network.removePlayer('Jane')
    expect(network.getPlayers()).toEqual(['John', undefined, 'Will'])
  })

  // TODO
  it('new members should fill empty spot first', () => {
    let network = Network.fromAdjecencyList(threeNodeGraph)
    network.addPlayer('John')
    network.addPlayer('Jane')
    network.addPlayer('Will')
    network.removePlayer('Jane')
    network.addPlayer('Mike')
    expect(network.getPlayers()).toEqual(['John', 'Mike', 'Will'])
  })

  describe('getNeighbours', () => {
    it('should work on full graph', () => {
      let network = Network.fromAdjecencyList(threeNodeGraph)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      expect(network.getNeighbours('John')).toEqual(['Jane', 'Will'])
    })

    it('should work on non-full graph', () => {
      let network = Network.fromAdjecencyList(threeNodeGraph)
      network.addPlayer('John')
      network.addPlayer('Jane')
      expect(network.getNeighbours('John')).toEqual(['Jane'])
    })

    it('should work on graph with empty nodes', () => {
      let network = Network.fromAdjecencyMatrix(threeNodeGraphAsMatrix)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.removePlayer('Jane')
      expect(network.getNeighbours('John')).toEqual(['Will'])
      expect(network.getNeighbours('Jane')).toEqual([])
      expect(network.getNeighbours('Will')).toEqual(['John'])
    })
  })

  describe('matrixToList', () => {
    it('should convert empty matrix', () => {
      expect(Network.matrixToList([])).toEqual([])
    })

    it('should convert simple matrix', () => {
      expect(Network.matrixToList(threeNodeGraphAsMatrix)).toEqual(threeNodeGraph)
    })
  })

  describe('listToMatrix', () => {
    it('should convert empty list', () => {
      expect(Network.listToMatrix([])).toEqual([])
    })

    it('should convert simple matrix', () => {
      expect(Network.listToMatrix(threeNodeGraph)).toEqual(threeNodeGraphAsMatrix)
    })
  })

  describe('solo', () => {
    it('noone has any neighbours', () => {
      let network = Network.solo(3)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      expect(network.getNeighbours('John')).toEqual([])
      expect(network.getNeighbours('Jane')).toEqual([])
      expect(network.getNeighbours('Will')).toEqual([])
    })
  })

  describe('pairs', () => {
    it('odd number of players', () => {
      let network = Network.pairs(3)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      expect(network.getNeighbours('John')).toEqual(['Jane'])
      expect(network.getNeighbours('Jane')).toEqual(['John'])
      expect(network.getNeighbours('Will')).toEqual([])
    })

    it('even number of players', () => {
      let network = Network.pairs(4)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.addPlayer('Mike')
      expect(network.getNeighbours('John')).toEqual(['Jane'])
      expect(network.getNeighbours('Jane')).toEqual(['John'])
      expect(network.getNeighbours('Will')).toEqual(['Mike'])
      expect(network.getNeighbours('Mike')).toEqual(['Will'])
    })
  })

  describe('groups of 3', () => {
    it('odd number of players', () => {
      let network = Network.groups(5, 3)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.addPlayer('Mike')
      network.addPlayer('Susan')
      expect(network.getNeighbours('John')).toEqual(['Jane', 'Will'])
      expect(network.getNeighbours('Jane')).toEqual(['John', 'Will'])
      expect(network.getNeighbours('Will')).toEqual(['John', 'Jane'])
      expect(network.getNeighbours('Mike')).toEqual(['Susan'])
      expect(network.getNeighbours('Susan')).toEqual(['Mike'])
    })

    it('even number of players', () => {
      let network = Network.groups(6, 3)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.addPlayer('Mike')
      network.addPlayer('Susan')
      network.addPlayer('Bono')
      expect(network.getNeighbours('John')).toEqual(['Jane', 'Will'])
      expect(network.getNeighbours('Jane')).toEqual(['John', 'Will'])
      expect(network.getNeighbours('Will')).toEqual(['John', 'Jane'])
      expect(network.getNeighbours('Mike')).toEqual(['Susan', 'Bono'])
      expect(network.getNeighbours('Susan')).toEqual(['Mike', 'Bono'])
      expect(network.getNeighbours('Bono')).toEqual(['Mike', 'Susan'])
    })
  })

  describe('clique', () => {
    it('odd number of players', () => {
      let network = Network.clique(4)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      expect(network.getNeighbours('John')).toEqual(['Jane', 'Will'])
      expect(network.getNeighbours('Jane')).toEqual(['John', 'Will'])
      expect(network.getNeighbours('Will')).toEqual(['John', 'Jane'])
    })

    it('even number of players', () => {
      let network = Network.clique(4)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.addPlayer('Mike')
      expect(network.getNeighbours('John')).toEqual(['Jane', 'Will', 'Mike'])
      expect(network.getNeighbours('Jane')).toEqual(['John', 'Will', 'Mike'])
      expect(network.getNeighbours('Will')).toEqual(['John', 'Jane', 'Mike'])
      expect(network.getNeighbours('Mike')).toEqual(['John', 'Jane', 'Will'])
    })
  })

  describe('circular', () => {
    it('one neighbour each', () => {
      let network = Network.circular(4, 1)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.addPlayer('Mike')
      expect(network.getNeighbours('John')).toEqual(['Mike', 'Jane'])
      expect(network.getNeighbours('Jane')).toEqual(['John', 'Will'])
      expect(network.getNeighbours('Will')).toEqual(['Jane', 'Mike'])
      expect(network.getNeighbours('Mike')).toEqual(['Will', 'John'])
    })

    it('even number of players', () => {
      let network = Network.circular(4, 2)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.addPlayer('Mike')
      expect(network.getNeighbours('John')).toEqual(['Will', 'Mike', 'Jane'])
      expect(network.getNeighbours('Jane')).toEqual(['Mike', 'John', 'Will'])
      expect(network.getNeighbours('Will')).toEqual(['John', 'Jane', 'Mike'])
      expect(network.getNeighbours('Mike')).toEqual(['Jane', 'Will', 'John'])
    })

    it('even number of players', () => {
      let network = Network.circular(6, 2)
      network.addPlayer('John')
      network.addPlayer('Jane')
      network.addPlayer('Will')
      network.addPlayer('Mike')
      network.addPlayer('Susan')
      network.addPlayer('Joanne')
      expect(network.getNeighbours('Susan')).toEqual(['Will', 'Mike', 'Joanne', 'John'])
    })
  })
})
