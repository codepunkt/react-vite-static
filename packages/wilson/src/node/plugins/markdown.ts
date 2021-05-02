import { extname } from 'path'
import { Plugin } from 'vite'
import { TransformResult } from 'rollup'
import state from '../state'
import { toRoot } from '../util'

/**
 * Transform markdown to HTML to Preact components
 */
const markdownPlugin = async (): Promise<Plugin> => {
  return {
    name: 'wilson-plugin-page-markdown',
    enforce: 'pre',

    transform(code: string, id: string): TransformResult {
      if (!id.startsWith(toRoot('./src/pages/'))) return
      if (extname(id) !== '.md') return

      const pageSource = state.pageSources.find(
        (pageSource) => pageSource.fullPath === id
      )!

      return {
        code: pageSource.transformedSource!,
      }
    },
  }
}

export default markdownPlugin
