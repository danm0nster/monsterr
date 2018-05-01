/* globals fabric */
function createCanvas (options) {
  let canvas = options.staticCanvas
    ? new fabric.StaticCanvas('canvas')
    : new fabric.Canvas('canvas')

  // apply background-color
  canvas.setBackgroundColor(options.canvasBackgroundColor)

  // resize the canvas to fill browser window dynamically
  function resizeCanvas () {
    canvas.setWidth(window.innerWidth)
    canvas.setHeight(window.innerHeight - options.chatHeight)
    canvas.renderAll()
  }
  window.addEventListener('resize', resizeCanvas, false)
  resizeCanvas()

  return canvas
}

export default createCanvas
