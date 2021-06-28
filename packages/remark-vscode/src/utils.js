import fs from 'fs'
import util from 'util'
import zlib from 'zlib'
import path from 'path'
import JSON5 from 'json5'
import plist from 'plist'
import logger from 'loglevel'

export const readdir = util.promisify(fs.readdir)
export const readFile = util.promisify(fs.readFile)
export const exists = util.promisify(fs.exists)
export const gunzip = util.promisify(zlib.gunzip)

/**
 * Splits a Visual Studio Marketplace extension identifier into publisher and extension name.
 * @param {string} identifier The unique identifier of a VS Code Marketplace extension in the format 'publisher.extension-name'.
 */
export function parseExtensionIdentifier(identifier) {
  const [publisher, name] = identifier.split('.')
  if (!name) {
    throw new Error(
      `Extension identifier must be in format 'publisher.extension-name'.`
    )
  }

  return { publisher, name }
}

/**
 * Gets the absolute path to the download path of a downloaded extension.
 */
export function getExtensionBasePath(identifier, extensionDir) {
  return path.join(extensionDir, identifier)
}

/**
 * Gets the absolute path to the data directory of a downloaded extension.
 */
export function getExtensionPath(identifier, extensionDir) {
  return path.join(getExtensionBasePath(identifier, extensionDir), 'extension')
}

/**
 * Gets the package.json of an extension as a JavaScript object.
 */
export function getExtensionPackageJson(identifier, extensionDir) {
  return require(path.join(
    getExtensionPath(identifier, extensionDir),
    'package.json'
  ))
}

/**
 * Gets the array of language codes that can be used to set the language of a Markdown code fence.
 * @param {*} languageRegistration A 'contributes.languages' entry from an extension’s package.json.
 */
export function getLanguageNames(languageRegistration) {
  return uniq(
    [
      languageRegistration.id,
      ...(languageRegistration.aliases || []),
      ...(languageRegistration.extensions || []),
    ].map((name) => name.toLowerCase().replace(/[^a-z0-9_+#-]/g, ''))
  )
}

/**
 * Strips special characters, replaces space with dashes, and lowercases a string.
 */
export function sanitizeForClassName(str) {
  return str
    .replace(/\s+/g, '-')
    .replace(/[^-_a-z0-9]/gi, '')
    .toLowerCase()
}

/**
 * @param {import('vscode-textmate').IToken} token
 * @param {import('vscode-textmate').ITokenizeLineResult2} binaryTokens
 */
export function getMetadataForToken(token, binaryTokens) {
  const index = binaryTokens.tokens.findIndex((_, i) => {
    return !(i % 2) && binaryTokens.tokens[i + 2] > token.startIndex
  })

  if (index > -1) {
    return binaryTokens.tokens[index + 1]
  }
  return binaryTokens.tokens[binaryTokens.tokens.length - 1]
}

export async function mergeCache(cache, key, value) {
  await cache.set(key, { ...(await cache.get(key)), ...value })
}

export function uniq(arr) {
  return Array.from(new Set(arr))
}

export function flatMap(arr, mapper) {
  const flattened = []
  for (const input of arr) {
    const mapped = mapper(input)
    if (Array.isArray(mapped)) {
      for (const output of mapped) {
        flattened.push(output)
      }
    } else {
      flattened.push(mapped)
    }
  }
  return flattened
}

export function createOnce() {
  const onceReturns = new Map()
  return once

  function once(fn, key = fn) {
    if (!onceReturns.has(key)) {
      const ret = fn()
      onceReturns.set(key, ret)
      return ret
    }
    return onceReturns.get(key)
  }
}

export function deprecationNotice(message) {
  logger.warn(`Deprecation notice: ${message}`)
}

export function isRelativePath(p) {
  return /^\.\.?[\\/]/.test(p)
}

export function partitionOne(arr, predicate) {
  const index = arr.findIndex(predicate)
  return [arr[index], arr.slice().splice(index, 1)]
}

export function last(arr) {
  return arr[arr.length - 1]
}

const htmlCharRegExp = /[<>&'"]/g
export function escapeHTML(html) {
  return String(html).replace(
    htmlCharRegExp,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
      }[char] || char)
  )
}

export const requireJson = (pathName) =>
  JSON5.parse(fs.readFileSync(pathName, 'utf8'))

export const requirePlistOrJson = async (pathName) =>
  path.extname(pathName) === '.json'
    ? requireJson(pathName)
    : plist.parse(await readFile(pathName, 'utf8'))
