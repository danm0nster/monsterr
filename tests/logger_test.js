var chai = require('chai');
var expect = chai.expect;

var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');

var _logger = require('../imports/logger');

describe('Logger', function() {

  var log_path = path.join(__dirname + '/../logs');

  beforeEach(function(done) {
    rimraf(log_path, () => {
      fs.mkdir(log_path, function() {
        done();
      });
    });
  });

  it('log should log to default file if no other logfile specified', function(done) {
    var logger = _logger({});
    logger.log('test');
    setTimeout(() => {
      var myPath = path.join(log_path, 'default.log');
      expect(fs.statSync(myPath).isFile()).to.equal(true); // file exists
      logger.getLog((res) => {
        expect(res['file'][0].message).to.equal('test');
        done();
      });
    }, 5);
  });

  it('log should log to specified file', function(done) {
    var logger = _logger({});
    logger.log('test', 'speclog');
    setTimeout(() => {
      var myPath = path.join(log_path, 'speclog.log');
      expect(fs.statSync(myPath).isFile()).to.equal(true); // file exists
      logger.getLog('speclog', (res) => {
        expect(res['file'][0].message).to.equal('test');
        done();
      });
    }, 5);
  });

  it('log should log extra data', function(done) {
    var logger = _logger({});
    logger.log('test', {extra: 'extra'});
    setTimeout(() => {
      var myPath = path.join(log_path, 'default.log');
      expect(fs.statSync(myPath).isFile()).to.equal(true); // file exists
      logger.getLog((res) => {
        expect(res['file'][0].message).to.equal('test');
        expect(res['file'][0].extra).to.equal('extra');
        done();
      });
    }, 5);
  });

  it('log should log extra data on specified file', function(done) {
    var logger = _logger({});
    logger.log('test', 'speclog', {extra: 'extra'});
    setTimeout(() => {
      var myPath = path.join(log_path, 'speclog.log');
      expect(fs.statSync(myPath).isFile()).to.equal(true); // file exists
      logger.getLog('speclog', (res) => {
        expect(res['file'][0].message).to.equal('test');
        expect(res['file'][0].extra).to.equal('extra');
        done();
      });
    }, 5);
  });


  afterEach(function(done) {
    rimraf(log_path, () => {
      fs.mkdir(log_path, function() {
        done();
      });
    });
  });
});
