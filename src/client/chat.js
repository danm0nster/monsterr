/* globals $ */

function append (msg) {
  let height = $('#messages')[0].scrollHeight
  console.log(height)
  console.log(window.innerHeight)
  $('#messages').append($('<li>').text(msg))
  $('#messages').animate({ scrollTop: height })
}

function clear () { $('#messages').html('') }

function createChat ({
  onCmd,
  onMsg
}) {
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

  return {
    append,
    clear
  }
}

export default createChat
