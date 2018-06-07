# Logging
Logging works exactly the same on server and client side, but the actual logs are of course stored on the server. On both sides logging is done through `monsterr.log`.

> Logging uses [winston](https://github.com/winstonjs/winston) internally.

## Options
The default log file can be set through `monsterr.options`.
```js
monsterr.options = {
  default_log_file: 'default'
}
```

## Default
The simplest possible log statement. Logs a message to the default log file.
```js
// logs to default.log
monsterr.log(message)
```

## Other logfiles
You can use multiple logfiles and for each log statement determine what file to write to.
```js
// logs to messages.log
monsterr.log(message, 'messages')
```

## Extra data
It is possible to log extra data. Simply supply it as the last argument. It is important that you supply it in JSON format.
```js
// default.log
monsterr.log(message, { something: 'extra' })

// messages.log
monsterr.log(message, 'messages', { something: 'extra' })
```
