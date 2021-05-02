import { basename, extname } from 'path'
import { pageTypes } from './constants'
import { Page } from '../types'
import { stat } from 'fs-extra'
import readdirp from 'readdirp'
import { getPagetype, parseFrontmatter } from './parse'
import cache from './cache'

export const getTags = () => [
  ...new Set(cache.pages.map((page) => page.frontmatter.tags).flat()),
]

export const collectPageData = async (root: string): Promise<void> => {
  const pageDir = `${root}/src/pages`

  for await (const { path, fullPath } of readdirp(pageDir)) {
    const extension = extname(basename(path))
    if (!Object.values(pageTypes).flat().includes(extension)) continue
    await getPageData(fullPath)
  }

  const additionalPages: Page[] = []
  for (const page of cache.pages) {
    if (page.frontmatter.multiple === 'tags') {
      const tagRegex = /\{\{tag\}\}/
      const pageIndex = cache.pages.findIndex((p) => p === page)
      cache.pages.splice(pageIndex, 1)
      for (const tag of getTags()) {
        const tagPage = {
          ...page,
          frontmatter: {
            ...page.frontmatter,
            permalink: page.frontmatter.permalink?.replace(tagRegex, tag),
            title: page.frontmatter.title.replace(tagRegex, tag),
          },
        }
        delete tagPage.frontmatter.multiple
        additionalPages.push(tagPage)
      }
      page.frontmatter.title = `${page.frontmatter.title}WAT`
    }
  }
}

const getDate = async (
  id: string,
  frontmatterDate: string | Date
): Promise<Date> => {
  if (frontmatterDate instanceof Date) {
    return frontmatterDate
  }
  const { ctime, mtime } = await stat(id)
  return frontmatterDate === 'Created' ? ctime : mtime
}

/**
 * Collects page data based on absolute path of a page.
 * Caches data so it doesn't have to be collected twice in a run.
 */
const getPageData = async (id: string): Promise<Page> => {
  let page = cache.pages.find((page) => page.source.absolutePath === id)
  if (page) {
    return page
  }

  const frontmatter = parseFrontmatter(id)

  const path = id.replace(new RegExp(`^${process.cwd()}/src/pages/`), '')
  const route = getPageRoute(path, frontmatter.permalink)
  const filePath = getStaticFilePath(route)

  const pageType = getPagetype(id) as Page['type'] | false
  if (pageType === false) {
    throw new Error(`Pagetype for extension ${id} not found!`)
  }

  const date = await getDate(id, frontmatter.date!)
  page = {
    type: pageType,
    frontmatter,
    date,
    source: {
      path,
      absolutePath: id,
    },
    result: {
      url: route,
      path: filePath,
    },
  }

  cache.pages.push(page)

  return page
}

/**
 * Matches all valid file extensions for pages.
 */
const pageExtension = new RegExp(
  `(${Object.values(pageTypes).flat().join('|')})$`
)

/**
 * Returns page route.
 */
export const getPageRoute = (
  pagePath: string,
  permalink: string | undefined
): string => {
  if (permalink !== undefined) {
    // @TODO
    // validate permalink (does URL already exist? is URL not empty?)
    if (!permalink.startsWith('/')) permalink = `/${permalink}`
    if (!permalink.endsWith('/')) permalink = `${permalink}/`
    return permalink
  }
  return `/${pagePath
    .replace(pageExtension, '')
    .toLowerCase()
    .replace(/index$/, '')}/`.replace(/\/\/$/, '/')
}

export const getStaticFilePath = (route: string): string => {
  return route.split('/').pop() === 'index'
    ? `${route.replace(/^\//, '')}.html`
    : `${route.replace(/^\//, '')}index.html`
}
