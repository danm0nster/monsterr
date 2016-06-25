// Group
var shortid = require('shortid');

module.exports = (function(options) {
  options = options || {};
  var _members = [];
  var _size = options.size || 2;
  var _id = options.id || shortid.generate();

  return {
    getId: function() {
      return _id;
    },

    getSize: function() {
      return _members.length;
    },

    isFull: function() {
      return (this.getSize() >= _size);
    },

    isEmpty: function() {
      return (this.getSize() <= 0);
    },

    isMember: function(id) {
      return _members.indexOf(id) !== -1;
    },
    addMember: function(id) {
      if (this.isMember(id)) {
        return false;
      } else {
        _members.push(id);
        return true;
      }
    },
    removeMember: function(id) {
      if (this.isMember(id)) {
        _members.splice(_members.indexOf(id), 1);
        return true;
      } else {
        return false;
      }
    },
    getMembers: function() {
      return _members;
    }

  }
});
