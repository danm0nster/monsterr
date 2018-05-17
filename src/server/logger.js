// Logger
import winston from 'winston'
import path from 'path'
import fs from 'fs'

export default function ({
  defaultLogfile = 'default',
  level = 'info'
} = {}) {
  const logPath = path.join(process.cwd(), '/logs')

  try {
    fs.statSync(logPath)
  } catch (err) {
    fs.mkdirSync(logPath)
  }

  const defaultLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        filename: path.join(logPath, defaultLogfile + '.log'),
        level: level
      })
    ]
  })

  const loggers = { default: defaultLogger }

  const addLogger = function (logFile) {
    const newLogger = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: path.join(logPath, logFile + '.log'),
          level: level
        })
      ]
    })
    loggers[logFile] = newLogger
  }

  const logToOther = function (logFile, msg, extra) {
    if (loggers[logFile]) {
      loggers[logFile].log(level, msg, extra)
    } else {
      // add logger and retry
      addLogger(logFile)
      logToOther(logFile, msg, extra)
    }
  }

  return {
    log: function (msg, logfileOrExtra, extra) {
      if (typeof logfileOrExtra === 'string') {
        // we want to log to different logFile
        logToOther(logfileOrExtra, msg, extra)
      } else {
        defaultLogger.log(level, msg, logfileOrExtra)
      }
    }
  }
}
