/** Hacky stuff to exp */

const Server = () => eval(`require('./src/express-server')`)
const Client = () => require('./src/monsterr-client')

module.exports.Server = Server
module.exports.Client = Client
