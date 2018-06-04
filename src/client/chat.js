/* globals $ */

function append (msg, name) {
  const $nameDiv = $(`<div class="name-div">${name || 'System'}</div>`)
  const $msgDiv = $(`<div class="msg-div">${msg}</div>`)

  const $liItem = $('<li>')
  $liItem.append($nameDiv, [$msgDiv])

  $('#messages')
    .append($liItem)

  let height = $('#messages')[0].scrollHeight
  $('#messages').animate({ scrollTop: height })
}

function rename (name, newName) {
  $('.name-div').text((_, text) => text.replace(name, newName))
}

function clear () {
  $('#messages').html('')
}

function createChat ({
  onCmd,
  onMsg,
  hidden = false
}) {
  if (hidden) { hide() }

  $('form').submit(function (event) {
    event.preventDefault()

    // parse whatever input the user submitted
    let { chatMsg, cmd } = parseInput($('#m').val())
    $('#m').val('')

    if (chatMsg) {
      onMsg(chatMsg)
      // socket.emit('event', { type: '_msg', payload: chatMsg })
    } else if (cmd) {
      let args = cmd.split(' ')
      onCmd({
        type: args[0],
        args: args.slice(1)
      })
    }

    return false
  })

  function parseInput (string) {
    let chatMsg
    let cmd

    if (string.substring(0, 1) === '/') {
      // treat as command
      cmd = string.substring(1)
    } else {
      chatMsg = string
    }

    return { chatMsg, cmd }
  }

  function hide () {
    hidden = true
    $('#chat-container').css('display', 'none')
    $(window).trigger('resize')
  }

  function show () {
    hidden = false
    $('#chat-container').css('display', 'flex')
    $(window).trigger('resize')
  }

  function toggle () {
    if (hidden) {
      show()
    } else {
      hide()
    }
  }

  return {
    isHidden: () => hidden,
    toggle,
    hide,
    show,
    append,
    clear,
    rename
  }
}

export default createChat
