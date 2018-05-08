/* globals $ */
import { clamp } from 'lodash'

function createHtmlContainer ({
  htmlContainerHeight = 0.3,
  html
}) {
  htmlContainerHeight = clamp(htmlContainerHeight, 0, 1)
  $('#html-container').html(html)

  return {
    setHeightRatio: newHeight => {
      htmlContainerHeight = clamp(newHeight, 0, 1)
      $(window).trigger('resize')
    },
    getHeightRatio: () => htmlContainerHeight,
    getHeightAbs: () => htmlContainerHeight * window.innerHeight,
    render: html => $('#html-container').html(html)
  }
}

export default createHtmlContainer
