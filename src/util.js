const isNode = typeof module.exports !== 'undefined' && typeof window === 'undefined'

/**
 * Given an event and an array of handler collections,
 * calls every matching handler with the specified context.
 * @param {*} event the event
 * @param {*} handlers the handler collections
 * @param {*} context the context
 */
export function handleEvent ({ type, payload, clientId } = {}, handlers, context) {
  console.log('EVENT:', { type, payload })
  handlers.forEach(
    handler => handler[type] && (isNode
      ? handler[type](context, clientId, payload)
      : handler[type](context, payload))
  )
}

/**
 * Given a command and an array of handler collections,
 * calls every matching handler with the specified context.
 * @param {*} command the command
 * @param {*} handlers the handler collections
 * @param {*} context the context
 */
export function handleCommand ({ type, args = [], clientId } = {}, handlers, context) {
  console.log('CMD:', { type, args, clientId })
  return handlers.reduce((shouldCall, handler) => {
    let res = handler[type] && (isNode
      ? handler[type](context, clientId, ...args)
      : handler[type](context, ...args))

    return (res === false) ? false : shouldCall
  }, true)
}
