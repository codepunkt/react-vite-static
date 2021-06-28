export default function createWriter() {
  let out = ''
  let indent = 0

  return {
    write,
    writeList,
    writeNewLine,
    increaseIndent,
    decreaseIndent,
    getText,
    noop,
  }

  function write(text) {
    out += text
  }
  function writeNewLine() {
    out += `\n${'  '.repeat(indent)}`
  }
  function increaseIndent() {
    indent++
  }
  function decreaseIndent() {
    indent--
  }
  function getText() {
    return out
  }
  function noop() {
    return
  }
}

function writeList(list, writeElement, writeSeparator) {
  list.forEach((element, i, { length }) => {
    writeElement(element)
    if (i < length - 1) {
      writeSeparator()
    }
  })
}
