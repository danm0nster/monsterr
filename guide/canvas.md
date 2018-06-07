# Canvas
On the client you get access to the `canvas` object, simply accessed with `monsterr.getCanvas()`.
Furthermore another very important object is available: `fabric`.
Fabric.js is the framework powering the canvas. Through the `fabric` object you can access the full suite of Fabric.js features. Use the `fabric` object to create objects that you can then add to the canvas. See [Fabric.js](http://fabricjs.com), their [guide](http://fabricjs.com/articles/) or their [documentation](http://fabricjs.com/docs/) for more information on how to use the `fabric` object, how to create, add, remove and manipulate objects on the canvas.
Fabric.js also comes with a powerful [event system](http://fabricjs.com/fabric-intro-part-2#events) that allows you to attach event handlers to objects and thereby record user actions and react on them.

## Options
The available canvas related options (and their defaults) are:
```js
options = {
  staticCanvas: false, // objects on the canvas are dynamic and can be moved, resized and more
  canvasBackgroundColor: '#999' // the canvas is per default grey
}
```


## Example
> The following is an extremely simple example. We refer to the *fabric* documentation for further use.

```js
// On client (prob. inside stage > setup())

client
  .getCanvas()
  .add(
    new fabric.Triangle({
      width: 50,
      height: 50,
      fill: 'red',
      left: 200,
      top: 500
    })
  )
```