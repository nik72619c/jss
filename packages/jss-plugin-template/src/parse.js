// @flow
import warning from 'tiny-warning'

const semiWithNl = /\n/

/**
 * Naive CSS parser.
 * - Supports only rule body (no selectors)
 * - Requires semicolon and new line after the value (except of last line)
 * - No nested rules support
 */
const parse = (cssText: string): Object => {
  const style = {}
  const split = cssText.split(semiWithNl)
  let nestedRuleProp

  for (let i = 0; i < split.length; i++) {
    const decl = (split[i] || '').trim()

    if (!decl) continue

    const ampIndex = decl.indexOf('&')

    if (nestedRuleProp === undefined) {
      // We have a nested rule.
      if (ampIndex !== -1) {
        const openCurlyIndex = decl.indexOf('{')
        if (openCurlyIndex === -1) {
          warning(false, `[JSS] Missing opening curly brace in "${decl}".`)
          continue
        }
        nestedRuleProp = decl.substring(0, openCurlyIndex - 1)
        style[nestedRuleProp] = {}
        continue
      }
    } else {
      const closeCurlyIndex = decl.indexOf('}')

      if (closeCurlyIndex !== -1) {
        nestedRuleProp = undefined
        // Closing brace should be on it's own line, otherwise the rest on that line
        // will be ignored, so we should warn the user.
        if (decl.length !== 1) {
          warning(false, `[JSS] Missing opening curly brace in "${decl}".`)
        }
        continue
      }
    }

    const colonIndex = decl.indexOf(':')
    if (colonIndex === -1) {
      warning(false, `[JSS] Missing colon in "${decl}".`)
      continue
    }

    const prop = decl.substring(0, colonIndex).trim()
    const value = decl.substring(colonIndex + 1, decl.length - 1).trim()

    if (nestedRuleProp) {
      style[nestedRuleProp][prop] = value
    } else {
      style[prop] = value
    }
  }
  return style
}

export default parse
