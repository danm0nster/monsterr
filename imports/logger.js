// Logger
var winston = require('winston');
var path = require('path');

module.exports = (function(options) {
  options = options || {};
  var _default = options.default || 'default';
  var _level = options.level || 'info';

  var _defaultLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        filename: path.join(__dirname, '/../logs/', _default + '.log'),
        level: _level
      })
    ]
  });

  var _loggers = { _default: _defaultLogger };

  var _addLogger = function(logger) {
    var newLogger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: path.join(__dirname, '/../logs/', logger + '.log'),
          level: _level
        })
      ]
    });
    _loggers[logger] = newLogger;
  };

  var _logToOther = function(logger, msg, extra) {
    if (Object.keys(_loggers).indexOf(logger) !== -1) {
      // it exists
      if (extra) {
        _loggers[logger].log(_level, msg, extra);
      } else {
        _loggers[logger].log(_level, msg);
      }
    } else {
      // otherwise add it
      _addLogger(logger);
      // and try again
      _logToOther(logger, msg, extra);
    }
  };

  return {
    log: function(msg, logfileOrExtra, extra) {
      switch (arguments.length) {
        case 1:
          _defaultLogger.log(_level, msg);
          break;
        case 2:
          if (typeof logfileOrExtra === 'string') {
            // log to different file
            _logToOther(logfileOrExtra, msg);
          } else {
            // extra
            _defaultLogger.log(_level, msg, logfileOrExtra);
          }
          break;
        case 3:
          // log to different file
          _logToOther(logfileOrExtra, msg, extra);
          break;
        default:

      }

    },
    getLog: function(logOrCb, cb) {
      if (arguments.length === 1) {

        _defaultLogger.query({
          fields: ['message', 'extra']
        }, function(err, res) {
          logOrCb(res);
        });
      } else {
        _loggers[logOrCb].query({
          fields: ['message', 'extra']
        }, function(err, res) {
          cb(res);
        })
      }
    }

  }
});
