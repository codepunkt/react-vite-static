import visit from 'unist-util-visit'
import { Node } from 'unist'
import { Element } from 'hast'

export interface AssetURLTagConfig {
  [tagName: string]: string[]
}

const defaultAssetUrlTagConfig = {
  video: ['src', 'poster'],
  source: ['src'],
  img: ['src'],
  image: ['xlink:href', 'href'],
  use: ['xlink:href', 'href'],
}

function isRelativeUrl(url: string): boolean {
  return /^\./.test(url)
}

export const assetUrlPrefix = '_assetUrl_'

// @TODO srcset check
// @see https://github.com/vuejs/vue-next/blob/2424768808e493ae1b59860ccb20a7c96d72d20a/packages/compiler-sfc/src/templateTransformSrcset.ts
export function collectAndReplaceAssetUrls(
  htmlAST: Node,
  assetUrlTagConfig: AssetURLTagConfig = defaultAssetUrlTagConfig
): string[] {
  const assetUrls = []

  visit(htmlAST, 'element', (node: Element) => {
    if (assetUrlTagConfig[node.tagName]) {
      const attributes: string[] = assetUrlTagConfig[node.tagName]
      attributes.forEach((attribute) => {
        if (typeof node.properties[attribute] !== 'string') return
        const assetUrl = node.properties[attribute] as string
        if (!isRelativeUrl(assetUrl)) return
        const index = assetUrls.findIndex((url) => url === assetUrl)
        if (index === -1) {
          node.properties[attribute] = `${assetUrlPrefix}${assetUrls.length}`
          assetUrls.push(assetUrl)
        } else {
          node.properties[attribute] = `${assetUrlPrefix}${index}`
        }
      })
    }
  })

  return assetUrls
}
