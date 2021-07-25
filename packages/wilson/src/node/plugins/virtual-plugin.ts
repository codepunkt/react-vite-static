import { Plugin } from 'vite'
import { LoadResult, ResolveIdResult } from 'rollup'
import { toRoot, transformJsx } from '../util.js'
import { getConfig } from '../config.js'
import { getPageSources } from '../state.js'
import { PageType } from '../page.js'
import { dirname, relative } from 'path'

const virtualExportsPath = 'wilson/virtual'
const clientEntryPath = '/@wilson/client.js'
const pageEntryPath = (pageSourceIndex: number, pageIndex: number) =>
  `@wilson/page-source/${pageSourceIndex}/page/${pageIndex}`

/**
 * Provides virtual modules.
 */
const virtualPlugin = async (): Promise<Plugin> => {
  return {
    name: 'wilson-plugin-virtual',
    enforce: 'pre',

    resolveId(id: string): ResolveIdResult {
      if (id === virtualExportsPath || id === clientEntryPath) {
        return id
      }
    },

    /**
     * Provide virtual module content.
     */
    async load(id: string): Promise<LoadResult> {
      if (id === clientEntryPath) {
        return `import "wilson/dist/client/main.js";`
      }

      if (id === virtualExportsPath) {
        const pageSources = getPageSources()
        const {
          siteData,
          layouts: { pageLayout },
        } = getConfig()

        const layoutImport = pageLayout
          ? `import Layout from '${relative(
              dirname(id),
              toRoot(`./src/layouts/${pageLayout}`)
            ).replace(/\\/g, '/')}';`
          : `import { Fragment as Layout } from 'preact';`

        const lazyPageImports = pageSources
          .map((pageSource, i) =>
            pageSource.pages.map((page: PageType, j: number) => {
              return `const PageSource${i}Page${j} = lazy(() => import('${pageEntryPath(
                i,
                j
              )}'));`
            })
          )
          .flat()
          .join('\n')

        const routes = pageSources
          .map((pageSource, i) =>
            pageSource.pages.map(
              (page: PageType, j: number) =>
                `<PageSource${i}Page${j} path="${page.route}" />`
            )
          )
          .flat()
          .join(',')

        const code = `
          import { h } from 'preact';
          import { lazy } from 'preact-iso';
          ${layoutImport}

          ${lazyPageImports}
          
          const routes = [${routes}];
          const siteData = ${JSON.stringify(siteData)};

          export { routes, siteData, Layout };
        `

        return transformJsx(code)
      }
    },
  }
}

export default virtualPlugin
