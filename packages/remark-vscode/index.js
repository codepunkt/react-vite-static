const visit = require('unist-util-visit')
const fs = require('fs')
const path = require('path')
const { parseRawGrammar, INITIAL, Registry } = require('vscode-textmate')
const { loadWASM, OnigScanner, OnigString } = require('vscode-oniguruma')

module.exports = () => {
  return (tree) => {
    visit(
      tree,
      (node) => ['code', 'inlineCode'].includes(node.type),
      (node) => {
        if (node.type === 'code') {
          const { lang, meta, value } = node
          console.log({ lang, meta, value })

          const wasmBin = fs.readFileSync(
            path.join(
              require.resolve('vscode-oniguruma'),
              '../../release/onig.wasm'
            )
          ).buffer
          const vscodeOnigurumaLib = loadWASM(wasmBin).then(() => {
            return {
              createOnigScanner(patterns) {
                return new OnigScanner(patterns)
              },
              createOnigString(s) {
                return new OnigString(s)
              },
            }
          })

          // Create a registry that can create a grammar from a scope name.
          const registry = new Registry({
            onigLib: vscodeOnigurumaLib,
            loadGrammar: async (scopeName) => {
              if (scopeName === 'source.js') {
                // https://github.com/textmate/javascript.tmbundle/blob/master/Syntaxes/JavaScript.plist
                const content = fs.readFileSync('./JavaScript.plist')
                return parseRawGrammar(content.toString())
              }
              console.log(`Unknown scope name: ${scopeName}`)
              return null
            },
          })

          // Load the JavaScript grammar and any other grammars included by it async.
          registry.loadGrammar('source.jas').then((grammar) => {
            if (grammar != null) {
              const text = [
                `function sayHello(name) {`,
                `\treturn "Hello, " + name;`,
                `}`,
              ]
              let ruleStack = INITIAL
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
    )
  }
}
