// Network

var group = require('./group');

module.exports = (function(options) {
  options = options || {};
  var _groups = [];
  var _groupSize = options.groupSize || 2;


  /**
  * Shuffles array in place.
  * @param {Array} a items The array containing the items.
  */
  var _shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    };
    return a;
  };

  return {
    getSize: function() {
      return _groups.reduce(function(sum, elem) {
        return sum + elem.getSize();
      }, 0);
    },
    getGroupSize: function() {
      return _groupSize;
    },

    isEmpty: function() {
      return (this.getSize() <= 0);
    },

    isMember: function(id) {
      return _groups.reduce(function(res, elem) {
        return (res || elem.isMember(id));
      }, false);
    },
    addMember: function(id) {
      if (this.isMember(id)) {
        return false;
      } else {
        var nfGroup = this.getNonFullGroup();
        nfGroup.addMember(id);
        return true;
      }
    },
    removeMember: function(id) {
      return _groups.reduce(function(res, elem) {
        return res || elem.removeMember(id);
      }, false);
    },

    getNonFullGroup() {
      var nfGroup = _groups.reduce(function(res, elem) {
        return res || (elem.isFull() ? null : elem);
      }, null);
      return nfGroup || this.newGroup();
    },

    newGroup: function() {
      var newGroup = group({size: _groupSize});
      _groups.push(newGroup);
      return newGroup;
    },
    getGroups: function() {
      return _groups;
    },

    isBalanced: function() {
      return _groups.reduce(function(res, elem) {
        return (res && elem.isFull());
      }, true);
    },

    setGroupSize: function(groupSize) {
      _groupSize = groupSize; // set new size and shuffle
      this.shuffle();
    },

    shuffle: function() {
      var that = this;

      // Get all members
      var _members = _groups.reduce(function(sum, elem) {
        return sum.concat(elem.getMembers());
      }, []);

      _groups = []; // Remove all existing groups

      _members = _shuffle(_members); // Shuffle the members

      // add them anew
      _members.forEach(function(member, index) {
        that.addMember(member);
      });
    }
  }
});
