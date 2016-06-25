var chai = require('chai');
var expect = chai.expect;

var _network = require('../imports/network');

describe('Network', function() {

  it('getSize() should return 0 if empty', function() {
    var network = _network({});
    expect(network.getSize()).to.equal(0);
  });
  it('getSize() should return 2 after two members added', function() {
    var network = _network();
    network.addMember('member1');
    network.addMember('member2')
    expect(network.getSize()).to.equal(2);
  });

  it('isEmpty() should return false if network is not empty', function() {
    var network = _network();
    network.addMember('member1');
    expect(network.isEmpty()).to.equal(false);
  });
  it('isEmpty() should return true if network is empty', function() {
    var network = _network();
    expect(network.isEmpty()).to.equal(true);
  });

  it('isMember() should return true if is a member', function() {
    var network = _network();
    network.addMember('member1');
    expect(network.isMember('member1')).to.equal(true);
  });
  it('isMember() should return false if not a member', function() {
    var network = _network();
    expect(network.isMember('member1')).to.equal(false);
  });

  it('addMember() should return false if already member', function() {
    var network = _network();
    network.addMember('member1');
    expect(network.addMember('member1')).to.equal(false);
  });
  it('addMember() should return true on new member', function() {
    var network = _network();
    expect(network.addMember('member1')).to.equal(true);
  });
  it('addMember() should add to existing group before creating a new one', function() {
    var network = _network();
    network.newGroup();
    expect(network.addMember('member1')).to.equal(true);
    expect(network.getGroups().length).to.equal(1);
  });
  it('addMember() should create and add to new group if no groups', function() {
    var network = _network();
    expect(network.addMember('member1')).to.equal(true);
    expect(network.getGroups().length).to.equal(1);
  });
  it('addMember() should create and add to new group if only full groups', function() {
    var network = _network({groupSize: 2});
    expect(network.addMember('member1')).to.equal(true);
    expect(network.addMember('member2')).to.equal(true);
    expect(network.addMember('member3')).to.equal(true);
    expect(network.getGroups().length).to.equal(2);
    expect(network.getGroups()[1].isMember('member3')).to.equal(true);
  });

  it('removeMember() should return false if not a member', function() {
    var network = _network();
    network.addMember('member1');
    expect(network.removeMember('member1')).to.equal(true);
  });
  it('removeMember() should return true if a member', function() {
    var network = _network();
    expect(network.removeMember('member1')).to.equal(false);
  });
  it('removeMember() should remove the right member', function() {
    var network = _network();
    network.addMember('member1');
    network.addMember('member2');
    network.addMember('member3');
    network.removeMember('member2');
    expect(network.isMember('member1')).to.equal(true);
    expect(network.isMember('member2')).to.equal(false);
  });

  it('getNonFullGroup() should return nonfull group', function() {
    var network = _network();
    network.newGroup();
    network.newGroup();
    expect(network.getNonFullGroup().isFull()).to.equal(false);
  });

  it('newGroup() should create new empty group', function() {
    var network = _network();
    network.newGroup();
    expect(network.getSize()).to.equal(0);
    expect(network.getGroups().length).to.equal(1);
  });
  it('getGroups() should return empty array if groups', function() {
    var network = _network();
    expect(network.getGroups().length).to.equal(0);
  });
  it('getGroups() should return array of groups', function() {
    var network = _network();
    network.newGroup();
    network.newGroup();
    expect(network.getGroups().length).to.equal(2);
  });

  it('getGroupSize() should return 2 per default', function() {
    var network = _network();
    expect(network.getGroupSize()).to.equal(2);
  });
  it('getGroupSize() should return whatever passed in options', function() {
    var network = _network({groupSize: 5});
    expect(network.getGroupSize()).to.equal(5);
  });

  it('isBalanced() should return true with no groups', function() {
    var network = _network();
    expect(network.isBalanced()).to.equal(true);
  });
  it('isBalanced() should return true with 2 groups 4 members, groupSize: 2', function() {
    var network = _network({groupSize: 2});
    network.addMember('member1');
    network.addMember('member2');
    network.addMember('member3');
    network.addMember('member4');
    expect(network.isBalanced()).to.equal(true);
  });
  it('isBalanced() should return false with 2 groups 3 members, groupSize: 2', function() {
    var network = _network({groupSize: 2});
    network.addMember('member1');
    network.addMember('member2');
    network.addMember('member3');
    expect(network.isBalanced()).to.equal(false);
  });
  it('isBalanced() should return false with 1 empty group', function() {
    var network = _network();
    network.newGroup();
    expect(network.isBalanced()).to.equal(false);
  });

  it('shuffle() should do nothing to empty network', function() {
    var network = _network();
    network.shuffle();
    expect(network.getGroups().length).to.equal(0);
    expect(network.isEmpty()).to.equal(true);
    expect(network.isBalanced()).to.equal(true);
  });

  it('shuffle() should persist groupSize, but have new groups (id)', function() {
    var network = _network({groupSize: 2});
    network.addMember('member1');
    network.addMember('member2');
    network.addMember('member3');
    network.addMember('member4');

    // save id's
    var id1 = network.getGroups()[0].getId();
    var id2 = network.getGroups()[1].getId();

    network.shuffle();
    expect(network.getGroups().length).to.equal(2);
    expect(network.isBalanced()).to.equal(true);

    // get new id's

    var id1new = network.getGroups()[0].getId();
    var id2new = network.getGroups()[1].getId();
    expect(id1new).to.not.equal(id1);
    expect(id2new).to.not.equal(id2);
  });

  it('setGroupSize() should change group size (variable)', function() {
    var network = _network({groupSize: 2});
    expect(network.getGroupSize()).to.equal(2);
    network.setGroupSize(3);
    expect(network.getGroupSize()).to.equal(3);
  });
  it('setGroupSize() should change group size (actual)', function() {
    var network = _network({groupSize: 2});
    network.addMember('member1');
    network.addMember('member2');
    network.addMember('member3');
    network.addMember('member4');
    network.addMember('member5');
    network.addMember('member6');
    expect(network.getGroupSize()).to.equal(2);
    expect(network.getGroups().length).to.equal(3);
    network.setGroupSize(3);
    expect(network.getGroupSize()).to.equal(3);
    expect(network.getGroups().length).to.equal(2);
  });

});
