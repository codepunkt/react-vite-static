import { Manifest, wrapManifest } from './manifest'
import { readFile, toRoot, readJson, writeFile, getPageData } from './util'
import { minify } from 'html-minifier-terser'
import chalk from 'chalk'
import size from 'brotli-size'

type PrerenderFn = (
  url: string
) => Promise<{
  html: string
  head: {
    lang: string
    title: string
    metas: Array<
      { content: string } & (
        | { name: string; property: undefined }
        | { name: undefined; property: string }
      )
    >
  }
  links: Set<string>
}>

const getCompressedSize = async (code: string): Promise<string> => {
  const isLarge = (code: string): boolean => code.length / 1024 > 500

  // bail out on particularly large chunks
  return isLarge(code)
    ? 'skipped (large chunk)'
    : `${(
        (await size(typeof code === 'string' ? code : Buffer.from(code))) / 1024
      ).toFixed(2)}kb`
}

const filterExistingTags = (template: string) => (path: string) =>
  !template.match(new RegExp(`(href|src)=/${path}`))

export async function prerenderStaticPages() {
  try {
    console.log(
      `${chalk.yellow(
        `wilson v${require('wilson/package.json').version}`
      )} prerendering static pages...`
    )
    const pages = await getPageData()
    const manifest = await readJson<Manifest>('./dist/manifest.json')
    const template = await readFile('./dist/index.html')
    const prerender = require(toRoot('./.wilson/ssr/entry-server.js'))
      .prerender as PrerenderFn

    let longestPath = 0
    const sources: Record<string, string> = {}

    for (const page of pages) {
      if (page.result.path.length > longestPath)
        longestPath = page.result.path.length

      const prerenderResult = await prerender(page.result.url)
      const wrappedManifest = wrapManifest(manifest)
      const pageDependencies = wrappedManifest.getPageDependencies(
        `src/pages/${page.source.path}`
      )

      // const linkDeps = Array.from(prerenderResult.links)
      //   .map((link) => {
      //     const page = pages.find((page) => page.result.url === link)
      //     if (!page) return false
      //     const deps = wrappedManifest.getPageDependencies(
      //       `src/pages/${page.source.path}`
      //     )
      //     return { link, deps }
      //   })
      //   .filter(Boolean)

      const styleTags = pageDependencies.css.map(
        (dependency) => `<link rel=stylesheet href=/${dependency}>`
      )
      const preloadTags = pageDependencies.js
        .filter(filterExistingTags(template))
        .map(
          (path) =>
            `<link rel=modulepreload as=script crossorigin href=/${path}></script>`
        )
      const scriptTags = pageDependencies.js
        .filter(filterExistingTags(template))
        .map((path) => `<script type=module crossorigin src=/${path}></script>`)

      const head = `
        <title>${prerenderResult.head.title}</title>
        ${prerenderResult.head.metas
          .map(
            ({ name, property, content }) =>
              `<meta ${
                name ? `name="${name}"` : `property="${property}"`
              } content="${content}">`
          )
          .join('')}
      `

      const source = `${template}`
        .replace(`<!--head-->`, head)
        .replace(`<!--html-->`, prerenderResult.html)
        .replace(`<!--style-tags-->`, styleTags.join(''))
        .replace(`<!--preload-tags-->`, preloadTags.join(''))
        .replace(`<!--script-tags-->`, scriptTags.join(''))

      const minifiedSource = minify(source, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        useShortDoctype: true,
      })

      sources[page.result.path] = minifiedSource
      await writeFile(toRoot(`./dist/${page.result.path}`), minifiedSource)
    }

    console.info(`${chalk.green('✓')} ${pages.length} pages rendered.`)
    for (const page of Object.keys(sources)) {
      console.info(
        `${chalk.grey(chalk.white.dim('dist/'))}${chalk.green(
          page.padEnd(longestPath + 2)
        )} ${chalk.dim(
          `${(sources[page].length / 1024).toFixed(
            2
          )}kb / brotli: ${await getCompressedSize(sources[page])}`
        )}`
      )
    }
  } catch (err) {
    console.error('error', err)
  }
}
