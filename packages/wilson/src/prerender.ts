import { extname } from 'path'
import { Page } from './collectPageData'
import { readFile, toRoot, readJson, writeFile } from './util'

// @TODO: read types from updated vite version, PR #2901
// https://github.com/vitejs/vite/pull/2901
type Manifest = Record<string, ManifestChunk>
interface ManifestChunk {
  src?: string
  file: string
  css?: string[]
  assets?: string[]
  isEntry?: boolean
  isDynamicEntry?: boolean
  imports?: string[]
  dynamicImports?: string[]
}

interface Dependencies {
  js: string[]
  css: string[]
  assets: string[]
}

type PrerenderFn = (
  url: string
) => Promise<{
  html: string
  links: Set<string>
}>

const filterExistingTags = (template: string) => (path: string) =>
  !template.match(new RegExp(`(href|src)=/${path}`))

function getDependencies(manifest: Manifest, pagePath: string): Dependencies {
  // add dependencies to sets to get rid of duplicates
  const jsDependencies = new Set<string>(
    getJsDependencies(manifest, [pagePath])
  )
  const cssDependencies = new Set<string>(
    getCssDependencies(manifest, [pagePath])
  )
  const assetDependencies = new Set<string>(
    getAssetDependencies(manifest, [pagePath])
  )

  // resolve chunks without rollup facade module ids
  let length = 0
  let prevLength = 0
  do {
    prevLength = length
    const sub = Array.from(jsDependencies).filter((dep) => dep.startsWith('_'))
    length = sub.length
    getJsDependencies(manifest, sub).map((j) => jsDependencies.add(j))
    getCssDependencies(manifest, sub).map((c) => cssDependencies.add(c))
    getAssetDependencies(manifest, sub).map((a) => assetDependencies.add(a))
  } while (length > prevLength)

  return {
    js: Array.from(jsDependencies).filter(
      (dep) => !dep.startsWith('_') && extname(dep) === '.js'
    ),
    css: Array.from(cssDependencies),
    assets: Array.from(assetDependencies),
  }
}

function getJsDependencies(manifest: Manifest, paths: string[]): string[] {
  return paths
    .map((path) => [manifest[path].file, ...(manifest[path].imports ?? [])])
    .flat()
}

function getCssDependencies(manifest: Manifest, paths: string[]): string[] {
  return paths.map((path) => manifest[path].css ?? []).flat()
}

function getAssetDependencies(manifest: Manifest, paths: string[]): string[] {
  return paths.map((path) => manifest[path].assets ?? []).flat()
}

// @TODO log files similar to vite
export async function prerenderStaticPages() {
  try {
    const pages = await readJson<Page[]>('./.wilson/tmp/page-data.json')
    const manifest = await readJson<Manifest>('./dist/manifest.json')
    const template = await readFile('./dist/index.html')

    for (const page of pages) {
      const deps = getDependencies(manifest, `src/pages/${page.source.path}`)
      const prerender = require(toRoot('./.wilson/tmp/server/entry-server.js'))
        .prerender as PrerenderFn
      const prerenderResult = await prerender(page.result.url)
      const styleTags = deps.css.map(
        (path) => `<link rel=stylesheet href=/${path}>`
      )
      // const linkDeps = Array.from(prerenderResult.links)
      //   .map((link) => {
      //     const page = pages.find((page) => page.result.url === link)
      //     if (!page) return false
      //     const deps = getDependencies(
      //       manifest,
      //       `src/pages/${page.source.path}`
      //     )
      //     return { link, deps }
      //   })
      //   .filter(Boolean)
      const preloadTags = deps.js
        .filter(filterExistingTags(template))
        .map(
          (path) =>
            `<link rel=modulepreload as=script crossorigin href=/${path}></script>`
        )
      const scriptTags = deps.js
        .filter(filterExistingTags(template))
        .map((path) => `<script type=module crossorigin src=/${path}></script>`)
      const source = `${template}`
        .replace(`<!--html-->`, prerenderResult.html)
        .replace(`<!--style-tags-->`, styleTags.join(''))
        .replace(`<!--preload-tags-->`, preloadTags.join(''))
        .replace(`<!--script-tags-->`, scriptTags.join(''))

      await writeFile(toRoot(`./dist/${page.result.path}`), source)
    }
  } catch (err) {
    console.log('error', err)
  }
}
