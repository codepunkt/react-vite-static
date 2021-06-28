import fs from 'fs'
import path from 'path'
import logger from 'loglevel'
import oniguruma from 'vscode-oniguruma'
import { getGrammarLocation, getGrammar, getAllGrammars } from './storeUtils.js'
import { readFile } from './utils.js'
import textmate from 'vscode-textmate'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const wasmBin = fs.readFileSync(
  path.join(require.resolve('vscode-oniguruma'), '../../release/onig.wasm')
).buffer
const onigLib = oniguruma.loadWASM(wasmBin).then(() => {
  return {
    createOnigScanner(patterns) {
      return new oniguruma.OnigScanner(patterns)
    },
    createOnigString(s) {
      return new oniguruma.OnigString(s)
    },
  }
})

function createEmitter() {
  let subscriber
  function emit() {
    if (subscriber) subscriber()
  }
  function subscribe(s) {
    subscriber = s
  }
  return { emit, subscribe }
}

// I’m not sure if there are any cases where Gatsby will try
// to run the plugin on multiple Markdown documents at once
// since it’s async, but we use a singleton Registry for
// performance and it’s stateful with respect to its current
// theme.
const getLock = (() => {
  let currentLock = Promise.resolve()
  async function getLock() {
    await currentLock
    const { emit, subscribe } = createEmitter()
    currentLock = new Promise((resolve) => {
      subscribe(resolve)
    })
    return function unlock() {
      emit()
    }
  }
  return getLock
})()

function warnMissingLanguageFile(missingScopeName, rootScopeName) {
  logger.info(
    `No language file was loaded for scope '${missingScopeName}' (requested by '${rootScopeName}').`
  )
}

export function createGetRegistry() {
  let registry

  async function getRegistry(cache, rootScopeName) {
    if (!registry) {
      const grammars = getAllGrammars(await cache.get('grammars'))
      registry = new textmate.Registry({
        loadGrammar: async (scopeName) => {
          const grammarInfo = getGrammar(scopeName, grammars)
          const fileName = grammarInfo && getGrammarLocation(grammarInfo)
          if (fileName) {
            const contents = await readFile(fileName, 'utf8')
            return textmate.parseRawGrammar(contents, fileName)
          }
          warnMissingLanguageFile(scopeName, rootScopeName)
        },
        getInjections: (scopeName) => {
          return Object.keys(grammars).reduce((acc, s) => {
            const grammar = grammars[s]
            if (grammar.injectTo && grammar.injectTo.includes(scopeName)) {
              acc.push(s)
            }
            return acc
          }, [])
        },
        onigLib,
      })
    }
    const unlock = await getLock()
    return [registry, unlock]
  }
  return getRegistry
}
