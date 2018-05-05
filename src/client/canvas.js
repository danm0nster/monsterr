import { debounce, clamp } from 'lodash'

/* globals fabric */
function createCanvas ({
  staticCanvas = false,
  canvasBackgroundColor = '#999',
  hideChat = false,
  htmlContainerHeight = 0
}) {
  let canvas = staticCanvas
    ? new fabric.StaticCanvas('canvas')
    : new fabric.Canvas('canvas')

  // apply background-color
  canvas.setBackgroundColor(canvasBackgroundColor)

  // resize the canvas to fill browser window dynamically
  function resizeCanvas () {
    canvas.setWidth(window.innerWidth - (hideChat ? 0 : 300))
    canvas.setHeight(window.innerHeight - clamp(htmlContainerHeight, 0, 1) * window.innerHeight)
    canvas.renderAll()
  }
  window.addEventListener('resize', debounce(resizeCanvas, 10), false)
  resizeCanvas()

  return canvas
}

export default createCanvas
