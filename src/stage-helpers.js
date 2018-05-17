/**
 * Repeat a stage 'n' times.
 * @param {{}} stage
 * @param {number} n
 */
export function repeat (stage = {}, n = 2) {
  return Array(n).fill(stage) // _.cloneDeep(stage)?
}

/**
 * Exact copy of stage, but with duration set.
 * @param {{}} stage
 * @param {number} duration
 */
export function withDuration (stage = {}, duration = 10000) {
  return {
    ...stage,
    options: {
      ...stage.options,
      duration
    }
  }
}
