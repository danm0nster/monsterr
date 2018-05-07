export default function runStage ({
  setup,
  teardown,
  timeout,
  context = {},
  duration
}) {
  let timer
  let terminated = false

  function modifiedTeardown (byTimer = false) {
    teardown && teardown(context)
    byTimer && timeout && timeout()
  }

  function terminateStage (byTimer = false) {
    if (terminated) { return }

    terminated = true
    timer && clearTimeout(timer)
    modifiedTeardown(byTimer)
  }

  if (duration) {
    timer = setTimeout(() => terminateStage(true), duration)
  }

  setup && setup(context)

  return () => terminateStage(false)
}
