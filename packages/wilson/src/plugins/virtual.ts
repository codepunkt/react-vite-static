import { Plugin } from 'vite'
import { LoadResult, ResolveIdResult } from 'rollup'
import { toRoot, transformJsx } from '../util'
import { resolveSiteData } from '../config'
import { mapPagePathToUrl, readPageFiles } from '../page'
import { extname } from 'path'

/**
 * Provides virtual import of routes and markdown page metadata.
 */
const virtualPlugin = async (): Promise<Plugin> => {
  const virtualImportPath = 'wilson/virtual'

  return {
    name: 'wilson-plugin-virtual',
    enforce: 'pre',

    /**
     * Resolve wilson/virtual imports
     */
    resolveId(id: string): ResolveIdResult {
      if (id.startsWith(virtualImportPath)) {
        return id
      }
    },

    /**
     * Provide content for wilson/virtual imports
     */
    async load(id: string): Promise<LoadResult> {
      if (id.startsWith(virtualImportPath)) {
        const pageFiles = await readPageFiles()
        const markdownPages = JSON.stringify(
          pageFiles.filter((page) => extname(page.path) === '.md')
        )

        const code =
          `import { h } from 'preact';` +
          `import { lazy } from 'preact-iso';` +
          pageFiles
            .map(
              (pageFile, i) =>
                `const Page${i} = lazy(() => import('${toRoot(
                  `/src/pages/${pageFile.path}`
                )}'));`
            )
            .join('\n') +
          `const routes = [` +
          pageFiles
            .map(
              (pageFile, i) =>
                `<Page${i} path="${mapPagePathToUrl(pageFile.path)}" />`
            )
            .join(',') +
          `];` +
          `const markdownPages = ${markdownPages};` +
          `const siteData = ${JSON.stringify(await resolveSiteData())};` +
          `export { markdownPages, routes, siteData };`
        return transformJsx(code)
      }
    },
  }
}

export default virtualPlugin
