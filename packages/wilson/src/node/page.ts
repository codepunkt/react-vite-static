import { basename, extname } from 'path'
import { pageTypes } from './constants'
import { Page } from '../types'
import { stat } from 'fs-extra'
import readdirp from 'readdirp'
import { getPagetype, parseFrontmatter } from './parse'
import cache from './cache'

export const collectPageData = async (root: string): Promise<void> => {
  const pageDir = `${root}/src/pages`

  for await (const { path, fullPath } of readdirp(pageDir)) {
    const extension = extname(basename(path))
    if (!Object.values(pageTypes).flat().includes(extension)) continue
    await getPageData(fullPath)
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
export const getPageData = async (id: string): Promise<Page> => {
  let page = cache.collections.all.find((p) => p.source.absolutePath === id)
  if (page) {
    return page
  }

  const path = id.replace(new RegExp(`^${process.cwd()}/src/pages/`), '')
  const url = mapPagePathToUrl(path)
  const resultPath =
    url.split('/').pop() === 'index'
      ? `${url.replace(/^\//, '')}.html`
      : `${url.replace(/^\//, '')}index.html`

  const pageType = getPagetype(id) as Page['type'] | false
  if (pageType === false) {
    throw new Error(`Pagetype for extension ${id} not found!`)
  }

  const frontmatter = await parseFrontmatter(id)
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
      url,
      path: resultPath,
    },
  }

  cache.collections.all.push(page)
  for (let tag of page.frontmatter.tags) {
    if (!cache.collections[tag]) {
      cache.collections[tag] = []
    }
    cache.collections[tag].push(page)
  }

  return page
}

/**
 * Matches all valid file extensions for pages.
 */
const pageExtension = new RegExp(
  `(${Object.values(pageTypes).flat().join('|')})$`
)

/**
 * Maps page path to URL
 */
export const mapPagePathToUrl = (pagePath: string): string => {
  return `/${pagePath
    .replace(pageExtension, '')
    .toLowerCase()
    .replace(/index$/, '')}/`.replace(/\/\/$/, '/')
}
