var chai = require('chai');
var expect = chai.expect;

var _group = require('../imports/group');

describe('Group', function() {

  it('getId() should return id passed in options', function() {
    var group = _group({id: 'passedID'});
    expect(group.getId()).to.equal('passedID');
  });
  it('getId() should generate new id if no id was passed', function() {
    var group = _group({});
    expect(group.getId()).to.be.a('string');
  });

  it('getSize() should return 0 if empty', function() {
    var group = _group({});
    expect(group.getSize()).to.equal(0);
  });
  it('getSize() should return 2 after two members added', function() {
    var group = _group();
    group.addMember('member1');
    group.addMember('member2')
    expect(group.getSize()).to.equal(2);
  });

  it('isFull() should return false if group is not full', function() {
    var group = _group({size: 3});
    group.addMember('member1');
    expect(group.isFull()).to.equal(false);
  });
  it('isFull() should return true if group is full', function() {
    var group = _group({size: 3});
    group.addMember('member1');
    group.addMember('member2');
    group.addMember('member3');
    expect(group.isFull()).to.equal(true);
  });

  it('isEmpty() should return false if group is not empty', function() {
    var group = _group();
    group.addMember('member1');
    expect(group.isEmpty()).to.equal(false);
  });
  it('isEmpty() should return true if group is empty', function() {
    var group = _group();
    expect(group.isEmpty()).to.equal(true);
  });

  it('isMember() should return true if is a member', function() {
    var group = _group();
    group.addMember('member1');
    expect(group.isMember('member1')).to.equal(true);
  });
  it('isMember() should return false if not a member', function() {
    var group = _group();
    expect(group.isMember('member1')).to.equal(false);
  });

  it('addMember() should return false if already member', function() {
    var group = _group();
    group.addMember('member1');
    expect(group.addMember('member1')).to.equal(false);
  });
  it('addMember() should return true on new member', function() {
    var group = _group();
    expect(group.addMember('member1')).to.equal(true);
  });

  it('removeMember() should return false if not a member', function() {
    var group = _group();
    group.addMember('member1');
    expect(group.removeMember('member1')).to.equal(true);
  });
  it('removeMember() should return true if a member', function() {
    var group = _group();
    expect(group.removeMember('member1')).to.equal(false);
  });
  it('removeMember() should remove the right member', function() {
    var group = _group();
    group.addMember('member1');
    group.addMember('member2');
    group.addMember('member3');
    group.removeMember('member2');
    expect(group.isMember('member1')).to.equal(true);
    expect(group.isMember('member2')).to.equal(false);
  });

  it('getMembers() should return empty array if no members', function() {
    var group = _group();
    expect(group.getMembers()).to.be.an('array');
    expect(group.getMembers().length).to.equal(0);
  });
  it('getMembers() should return array of members', function() {
    var group = _group();
    group.addMember('member1');
    group.addMember('member2');
    group.addMember('member3');
    expect(group.getMembers()).to.be.an('array');
    expect(group.getMembers().length).to.equal(3);
  });

});
