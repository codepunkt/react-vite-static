import createWriter from './createWriter.js'
import { escapeHTML } from '../utils.js'
import { joinClassNames, renderCSS } from './css.js'

export function createElement(tagName, attributes, children, renderOptions) {
  return { tagName, attributes, children, renderOptions }
}

export function mergeAttributes(...attrs) {
  return attrs.reduce((acc, attrs) => {
    const merged = { ...acc, ...attrs }
    // eslint-disable-next-line
    if (acc.hasOwnProperty('class')) {
      merged.class = joinClassNames(acc.class, attrs.class)
    }
    return merged
  }, {})
}

function factory(tagName) {
  return (attributes, children, options) =>
    createElement(tagName, attributes || {}, children || [], options)
}

export const pre = factory('pre')
export const code = factory('code')
export const span = factory('span')
export const style = factory('style')

export const TriviaRenderFlags = {
  NoWhitespace: 0,
  NewlineAfterOpeningTag: 1 << 0,
  NewlineBeforeClosingTag: 1 << 1,
  NewlineBetweenChildren: 1 << 2,
  IndentChildren: 1 << 3,
  SplitStringsIntoLines: 1 << 4,
}

export function renderHTML(element) {
  const writer = createWriter()
  writeElement(element)
  return writer.getText()

  function writeElement(element) {
    let whitespace = element.renderOptions && element.renderOptions.whitespace
    if (whitespace === undefined) {
      whitespace = -1
    }

    const { tagName, attributes, children } = element
    const attrs = Object.keys(attributes)
      .filter((attr) => attributes[attr] !== undefined)
      .map((attr) => ` ${attr}="${escapeHTML(attributes[attr])}"`)
      .join('')

    writer.write(`<${tagName}${attrs}>`)

    let indented = false
    if (whitespace & TriviaRenderFlags.NewlineAfterOpeningTag) {
      if (whitespace & TriviaRenderFlags.IndentChildren) {
        writer.increaseIndent()
        indented = true
      }
      writer.writeNewLine()
    }

    const writeSeparator =
      whitespace & TriviaRenderFlags.NewlineBetweenChildren
        ? writer.writeNewLine
        : writer.noop
    writer.writeList(
      children,
      (child) => writeChild(child, whitespace),
      writeSeparator
    )
    if (indented) {
      writer.decreaseIndent()
    }

    if (whitespace & TriviaRenderFlags.NewlineBeforeClosingTag) {
      writer.writeNewLine()
    }
    writer.write(`</${tagName}>`)
  }

  function writeChild(child, parentWhitespace) {
    if (typeof child === 'string') {
      if (parentWhitespace & TriviaRenderFlags.SplitStringsIntoLines) {
        writer.writeList(
          child.split(/\r?\n/),
          writer.write,
          writer.writeNewLine
        )
      } else {
        writer.write(child)
      }
    } else if ('tagName' in child) {
      writeElement(child)
    } else {
      renderCSS([child], writer)
    }
  }
}
