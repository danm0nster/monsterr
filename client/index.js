/* globals monsterr fabric */

monsterr.events = {
  'storeUpdate': function (store) {
    monsterr.chat.prepend(`counter: ${store.counter}`)
  }
}

monsterr.run()

monsterr.send('action', {
  action: 'incCounter',
  args: [3]
})

fabric.Image.fromURL('cat.jpg', function (oImg) {
  monsterr.canvas.add(oImg)
})
