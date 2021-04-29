import { extname } from 'path'
import { Frontmatter } from '../types'
import { pageTypes as defaultPageTypes } from './constants'
import grayMatter from 'gray-matter'
import { readFile } from 'fs-extra'
import { transpileModule, ModuleKind, JsxEmit } from 'typescript'
import acorn, { parse } from 'acorn'
import { walk } from 'estree-walker'
import {
  ObjectExpression,
  AssignmentExpression,
  MemberExpression,
  Identifier,
} from 'estree'
import { generate } from 'astring'
import { objectSourceToObject } from './eval'

/**
 * Maps absolute paths of page files to pagetype strings or
 * `false` when no valid pagetype exists.
 */
const pagetypeCache: Record<string, string | false> = {}

/**
 * Returns pagetype (e.g. `markdown`) for the absolute path
 * of page file or `false` none was found.
 */
const getPagetype = (
  absolutePath: string,
  pageTypes?: typeof defaultPageTypes
): string | false => {
  if (pagetypeCache[absolutePath]) {
    return pagetypeCache[absolutePath]
  }

  const moduleExtension = extname(absolutePath)
  const types = pageTypes ?? defaultPageTypes

  for (const type in types) {
    if (types[type].includes(moduleExtension)) {
      pagetypeCache[absolutePath] = type
      return type
    }
  }

  pagetypeCache[absolutePath] = false
  return false
}

/**
 * Transpiles TypeScript source code to JavaScript source code.
 */
const transpileTypescriptToJavascript = (typescriptString: string): string => {
  const compilerOptions = {
    module: ModuleKind.CommonJS,
    jsx: JsxEmit.ReactJSX,
    jsxImportSource: 'preact',
  }
  const transpileOptions = { compilerOptions }
  const transpileOutput = transpileModule(typescriptString, transpileOptions)

  return transpileOutput.outputText
}

/**
 * Creates a JavaScript AST for JavaScript source code.
 */
const createJavascriptAST = (javascriptString: string): acorn.Node => {
  const acornOptions: acorn.Options = { ecmaVersion: 'latest' }
  const ast = parse(javascriptString, acornOptions)
  return ast
}

/**
 * Default values for optional properties in frontmatter.
 */
const defaultFrontmatter: Partial<Frontmatter> = {
  draft: false,
  date: 'Created',
  tags: [],
}

/**
 *
 */
const parseMarkdownFrontmatter = (
  markdownString: string
): Partial<Frontmatter> => {
  const graymatterOptions = {}
  const parsed = grayMatter(markdownString, graymatterOptions)
  return parsed.data as Partial<Frontmatter>
}

/**
 *
 */
const parseTypescriptFrontmatter = (
  typescriptString: string
): Partial<Frontmatter> => {
  const javascriptString = transpileTypescriptToJavascript(typescriptString)
  const javascriptAST = createJavascriptAST(javascriptString)

  let frontmatterNode: ObjectExpression | null = null
  walk(javascriptAST, {
    enter(node) {
      // we're only interested in AssignmentExpression
      if (node.type !== 'AssignmentExpression') return

      // we're only interested in equal assignments between a MemberExpression
      // and an ObjectExpression
      const ae = node as AssignmentExpression
      if (
        ae.operator !== '=' ||
        ae.left.type !== 'MemberExpression' ||
        ae.right.type !== 'ObjectExpression'
      ) {
        return
      }

      // we're only interested in AssignmentExpression where the left
      // MemberExpression has object and property Identifier that say
      // `exports frontmatter`
      const me = ae.left as MemberExpression
      if (
        me.object.type !== 'Identifier' ||
        me.property.type !== 'Identifier' ||
        (me.object as Identifier).name !== 'exports' ||
        (me.property as Identifier).name !== 'frontmatter'
      ) {
        return
      }

      // found an `exports frontmatter = <ObjectExpression>` node.
      // we are interested in the ObjectExpression, so that's what we keep.
      frontmatterNode = ae.right as ObjectExpression
    },
  })

  const objSource = frontmatterNode
    ? generate(frontmatterNode, { indent: '', lineEnd: '' })
    : '{}'

  return {
    ...objectSourceToObject(objSource),
  } as Partial<Frontmatter>
}

/**
 *
 */
const parseFrontmatter = async (absolutePath: string): Promise<Frontmatter> => {
  const content = await readFile(absolutePath, 'utf-8')
  const pageType = getPagetype(absolutePath)

  let frontmatter: Partial<Frontmatter>
  if (pageType === 'markdown') {
    frontmatter = parseMarkdownFrontmatter(content)
  } else {
    frontmatter = parseTypescriptFrontmatter(content)
  }

  if (Object.values(frontmatter).length === 0) {
    throw new Error(`page has no or empty frontmatter: ${absolutePath}!`)
  }
  if (frontmatter.title === undefined) {
    throw new Error(`frontmatter has no title: ${absolutePath}!`)
  }

  return {
    ...defaultFrontmatter,
    ...frontmatter,
  } as Frontmatter
}

export { getPagetype, parseFrontmatter, transpileTypescriptToJavascript }
