/* globals $ */
import { clamp } from 'lodash'

function createHtmlContainer ({
  htmlContainerHeight = 0.3
}) {
  htmlContainerHeight = clamp(htmlContainerHeight, 0, 1)

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
