import createWriter from './createWriter.js'

export function renderMediaQuery(condition, rules) {
  return `@media (${condition}) {\n${
    typeof rules === 'string' ? rules : rules.join('\n')
  }\n}`
}

export function prefersLight(rules) {
  return renderMediaQuery('prefers-color-scheme: light', rules)
}

export function prefersDark(rules) {
  return renderMediaQuery('prefers-color-scheme: dark', rules)
}

export function prefixRules(rules, prefix) {
  return rules.map((rule) => (rule.trim() ? prefix + rule : ''))
}

export function joinClassNames(...classNames) {
  let result = ''
  for (const className of classNames) {
    if (className && className.trim()) {
      result += ` ${className}`
    }
  }

  return result.trim()
}

export function media(mediaQueryList, body, leadingComment) {
  return { kind: 'MediaQuery', mediaQueryList, body, leadingComment }
}

export function ruleset(selector, body, leadingComment) {
  return {
    kind: 'Ruleset',
    selectors: Array.isArray(selector) ? selector : [selector],
    body: Array.isArray(body)
      ? body
      : Object.keys(body).map((property) =>
          declaration(property, body[property])
        ),
    leadingComment,
  }
}

export function declaration(property, value) {
  return { property, value }
}

export function renderCSS(elements, writer = createWriter()) {
  writer.writeList(
    elements,
    (element) => {
      if (element.kind === 'MediaQuery') {
        writeComment(element)
        writer.write(`@media ${element.mediaQueryList} {`)
        writer.increaseIndent()
        writer.writeNewLine()
        writer.writeList(element.body, renderRuleset, writer.writeNewLine)
        writer.decreaseIndent()
        writer.writeNewLine()
        writer.write('}')
      } else {
        renderRuleset(element)
      }
    },
    writer.writeNewLine
  )

  return writer.getText()

  function renderRuleset(ruleset) {
    writeComment(ruleset)
    writer.writeList(ruleset.selectors, writer.write, () => {
      writer.write(',')
      writer.writeNewLine()
    })

    writer.write(' {')
    const multiline = ruleset.body.length > 1
    if (multiline) {
      writer.increaseIndent()
      writer.writeNewLine()
    } else {
      writer.write(' ')
    }
    writer.writeList(ruleset.body, writeDeclaration, writer.writeNewLine)
    if (multiline) {
      writer.decreaseIndent()
      writer.writeNewLine()
    } else {
      writer.write(' ')
    }
    writer.write('}')
  }

  function writeComment(element) {
    if (element.leadingComment) {
      writer.writeNewLine()
      writer.write(`/* ${element.leadingComment} */`)
      writer.writeNewLine()
    }
  }

  function writeDeclaration(declaration) {
    writer.write(`${declaration.property}: ${declaration.value};`)
  }
}
