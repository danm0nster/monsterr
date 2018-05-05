/* globals fabric $ */
import { debounce, clamp } from 'lodash'

function createCanvas ({
  staticCanvas = false,
  canvasBackgroundColor = '#999',
  getUsedWidth = () => 0,
  htmlContainerHeight = 0
}) {
  let canvas = staticCanvas
    ? new fabric.StaticCanvas('canvas')
    : new fabric.Canvas('canvas')

  // apply background-color
  canvas.setBackgroundColor(canvasBackgroundColor)

  // resize the canvas to fill browser window dynamically
  function resizeCanvas () {
    canvas.setWidth(window.innerWidth - getUsedWidth())
    canvas.setHeight(window.innerHeight - clamp(htmlContainerHeight, 0, 1) * window.innerHeight)
    canvas.renderAll()
  }
  resizeCanvas()

  $(window).resize(debounce(resizeCanvas, 10))

  return canvas
}

export default createCanvas
