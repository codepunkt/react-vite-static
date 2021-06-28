import { visit } from 'unist-util-visit'
import fs from 'fs'
import path from 'path'
import textmate from 'vscode-textmate'
import oniguruma from 'vscode-oniguruma'
import { createRequire } from 'module'
import { createGetRegistry } from './src/createGetRegistry.js'
import { setup } from './src/setup.js'
import { getCache } from './src/cache.js'

const cache = getCache('wat')

export default (options) => {
  const require = createRequire(import.meta.url)
  const getRegistry = createGetRegistry()

  return async (tree) => {
    const {
      theme,
      wrapperClassName,
      languageAliases,
      extensions,
      getLineClassName,
      injectStyles,
      replaceColor,
      logLevel,
      getLineTransformers,
      inlineCode,
      ...rest
    } = await setup(options, cache)

    const nodes = []

    visit(
      tree,
      (node) => ['code', 'inlineCode'].includes(node.type),
      (node) => {
        nodes.push(node)
      }
    )

    for (const node of nodes) {
      if (node.type === 'code') {
        const { lang, meta, value } = node
        console.log({ lang, meta, value })

        const grammarCache = await cache.get('grammars')
        console.log(grammarCache)
        const scope = getScope(languageName, grammarCache, languageAliases)

        const wasmBin = fs.readFileSync(
          path.join(
            require.resolve('vscode-oniguruma'),
            '../../release/onig.wasm'
          )
        ).buffer
        console.log(wasmBin)
        const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
          return {
            createOnigScanner(patterns) {
              return new oniguruma.OnigScanner(patterns)
            },
            createOnigString(s) {
              return new oniguruma.OnigString(s)
            },
          }
        })

        // Create a registry that can create a grammar from a scope name.
        const registry = new textmate.Registry({
          onigLib: vscodeOnigurumaLib,
          loadGrammar: async (scopeName) => {
            if (scopeName === 'source.js') {
              // https://github.com/textmate/javascript.tmbundle/blob/master/Syntaxes/JavaScript.plist
              const content = fs.readFileSync('./JavaScript.plist')
              return textmate.parseRawGrammar(content.toString())
            }
            console.log(`Unknown scope name: ${scopeName}`)
            return null
          },
        })

        // Load the JavaScript grammar and any other grammars included by it async.
        registry.loadGrammar('source.js').then((grammar) => {
          if (grammar != null) {
            const text = [
              `function sayHello(name) {`,
              `\treturn "Hello, " + name;`,
              `}`,
            ]
            let ruleStack = textmate.INITIAL
            for (let i = 0; i < text.length; i++) {
              const line = text[i]
              const lineTokens = grammar.tokenizeLine(line, ruleStack)
              console.log(`\nTokenizing line: ${line}`)
              for (let j = 0; j < lineTokens.tokens.length; j++) {
                const token = lineTokens.tokens[j]
                console.log(
                  ` - token from ${token.startIndex} to ${token.endIndex} ` +
                    `(${line.substring(token.startIndex, token.endIndex)}) ` +
                    `with scopes ${token.scopes.join(', ')}`
                )
              }
              ruleStack = lineTokens.ruleStack
            }
          }
        })
      }
    }
  }
}
