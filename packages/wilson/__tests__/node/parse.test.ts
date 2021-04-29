import {
  getPagetype,
  transpileTypescriptToJavascript,
} from '../../src/node/parse'
import typescript from 'typescript'

jest.spyOn(typescript, 'transpileModule')

describe('getPagetype', () => {
  test('returns pagetype', () => {
    expect(
      getPagetype('/absolute/path/known-file.md', { amazingFile: ['.md'] })
    ).toBe('amazingFile')
  })
  test('returns false for unknown pagetype', () => {
    expect(getPagetype('/absolute/path/unknown-file.md', {})).toBe(false)
  })
  test('caches results with absolutePath as key', () => {
    expect(getPagetype('/absolute/path/cached-file.md')).toBe('markdown')
    expect(
      getPagetype('/absolute/path/cached-file.md', {
        unused: ['.md'],
      })
    ).toBe('markdown')
  })
})

describe('transpileTypescriptToJavascript', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('calls typescript `transpileModule` with given string', () => {
    const inputString = 'const sum = (a: number, b: number) => a + b;'
    transpileTypescriptToJavascript(inputString)
    expect(typescript.transpileModule).toHaveBeenCalledTimes(1)
    expect(typescript.transpileModule).toHaveBeenCalledWith(
      inputString,
      expect.anything()
    )
  })
  test('transpiles to CommonJS', () => {
    const result = transpileTypescriptToJavascript(
      'export default "foo";export const bar = "baz";'
    )
    expect(result).toMatch(/exports\.default\s*=\s*"foo";/)
    expect(result).toMatch(/exports\.bar\s*=\s*"baz";/)
  })
  test('transpiles JSX using preact', () => {
    const result = transpileTypescriptToJavascript(
      'export default function Headline() { return <h1>Hello world</h1>; };'
    )
    expect(result).toMatch(/require\("preact\/jsx-runtime"\)/)
    expect(result).toMatch(/\.jsx\("h1",\s{\schildren:\s"Hello\sworld/)
  })
})
