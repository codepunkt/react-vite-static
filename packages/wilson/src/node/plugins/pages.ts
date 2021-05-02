import { Plugin } from 'vite'
import { TransformResult, LoadResult, ResolveIdResult } from 'rollup'
import { dirname, relative } from 'path'
import { toRoot, transformJsx } from '../util'
import minimatch from 'minimatch'
import { resolveUserConfig } from '../config'
import cache from '../cache'
import state from '../state'
import { ClientPage } from '../../types'

const virtualPageRegex = /^@wilson\/page-source\/(\d+)\/page\/(\d+)/

/**
 * Wrap pages into wrapper components for <head> meta etc.
 */
const pagesPlugin = async (): Promise<Plugin> => {
  return {
    name: 'wilson-plugin-pages',
    enforce: 'pre',

    resolveId(id: string): ResolveIdResult {
      const match = id.match(virtualPageRegex)
      if (match === null) return
      return id
    },

    /**
     * @todo is this required?
     */
    load(id: string): LoadResult {
      const match = id.match(virtualPageRegex)
      if (match === null) return
      return 'wat'
    },

    async transform(code: string, id: string): Promise<TransformResult> {
      const match = id.match(virtualPageRegex)
      if (match === null) return

      const pageSourceIndex = parseInt(match[1], 10)
      const pageSource = state.pageSources[pageSourceIndex]
      const pageIndex = parseInt(match[2], 10)
      const page = pageSource.pageFiles[pageIndex]

      if (page === undefined) {
        throw new Error('kaput!')
      }

      const { pageLayouts } = await resolveUserConfig()
      const pageLayout =
        pageSource.frontmatter.layout ?? typeof pageLayouts === 'undefined'
          ? undefined
          : pageLayouts.find(({ pattern = '**' }) =>
              minimatch(
                pageSource.fullPath.replace(
                  new RegExp(`^${process.cwd()}/src/pages/`),
                  ''
                ),
                pattern
              )
            )?.layout

      const inject: { pages?: ClientPage[] } = {}
      const hasInject =
        pageSource.type === 'typescript' &&
        page.frontmatter.inject !== undefined

      if (hasInject) {
        const collections = page.frontmatter.inject!.pages.collections
        const pages = []
        for (const collection of collections) {
          pages.push(
            ...state.pageSources.filter((pageSource) =>
              pageSource.frontmatter.tags.includes(collection)
            )
          )
        }
        inject.pages = []
        // inject.pages = pages
        //   .map(pageToClientPage)
        //   .sort((a, b) => b.date.getTime() - a.date.getTime())
      }

      const frontmatterString = JSON.stringify(page.frontmatter)

      const ogType = page.frontmatter.ogType ?? 'website'
      const layoutImport = pageLayout
        ? `import Layout from '${relative(
            dirname(id),
            toRoot(`./src/layouts/${pageLayout}`)
          )}';`
        : `import { Fragment as Layout } from 'preact';`

      const wrapper = `
        import { h } from 'preact';
        import { useMeta, useTitle } from 'hoofd/preact';
        import { siteData } from 'wilson/virtual';
        import { Page } from '${pageSource.fullPath}';
        ${layoutImport}

        export default function PageWrapper() {
          const pageUrl = siteData.siteUrl + '${page.route}';
          const title = '${page.frontmatter.title}';

          useMeta({ property: 'og:url', content: pageUrl });
          useMeta({ property: 'og:image', content: pageUrl + 'og-image.jpg' });
          useMeta({ property: 'og:image:secure_url', content: pageUrl + 'og-image.jpg' });
          useMeta({ property: 'og:title', content: title });
          useMeta({ property: 'og:type', content: '${ogType}' });
          useMeta({ property: 'twitter:title', content: title });
          useTitle(title);

          return <Layout
            frontmatter={${frontmatterString}}
            toc={${JSON.stringify(cache.markdown.toc.get(pageSource.fullPath))}}
          >
            <Page
              title="${page.frontmatter.title}"
              inject={${JSON.stringify(inject)}}
            />
          </Layout>;
        }`

      return {
        code: transformJsx(wrapper),
      }
    },
  }
}

export default pagesPlugin
