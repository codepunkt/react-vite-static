import { highlightLine } from './transformerUtils.js'

const dashRegExp = /[-–—]/
const rangeRegExp = /^\d+[-–—]\d+$/
const numberRegExp = /^\d+$/

function getLinesFromMeta(meta) {
  const lines = []
  for (const key in meta) {
    if (meta[key] === true) {
      if (numberRegExp.test(key)) lines.push(parseInt(key, 10))
      else if (rangeRegExp.test(key)) {
        const [lower, upper] = key.split(dashRegExp).map((s) => parseInt(s, 10))
        for (let i = lower; i <= upper; i++) lines.push(i)
      }
    }
  }
  return lines
}

function getInitialState(meta) {
  return {
    lineNumber: 1,
    highlightedLines: getLinesFromMeta(meta),
  }
}

export const highlightMetaTransformer = ({
  meta,
  line,
  state = getInitialState(meta),
}) => {
  const isHighlighted = state.highlightedLines[0] === state.lineNumber
  return {
    line: isHighlighted ? highlightLine(line) : line,
    ...(isHighlighted && { data: { isHighlighted } }),
    state: {
      lineNumber: state.lineNumber + 1,
      highlightedLines: isHighlighted
        ? state.highlightedLines.slice(1)
        : state.highlightedLines,
    },
    setContainerClassName: isHighlighted
      ? 'grvsc-has-line-highlighting'
      : undefined,
  }
}

highlightMetaTransformer.displayName = 'highlightCodeFenceOptions'
highlightMetaTransformer.schemaExtension = `
  type GRVSCTokenizedLine {
    isHighlighted: Boolean
  }
`
