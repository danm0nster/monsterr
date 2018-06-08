/**
 * Repeat a stage 'n' times.
 * @param {{}} stage
 * @param {number} n
 * @param {string[]} names names to apply to stages (default 'unnamed')
 */
export function repeat (stage = {}, n = 2, names) {
  // _.cloneDeep(stage)?
  return Array(n)
    .fill(stage)
    .map((stage, idx) => withName(stage, names && names[idx]))
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

/**
 * Exact copy of stage, but with name.
 * @param {{}} stage
 * @param {string} name
 */
export function withName (stage = {}, name) {
  return name
    ? {
      ...stage,
      name
    }
    : stage
}
