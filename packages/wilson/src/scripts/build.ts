import { build } from 'vite'
import { getConfig } from '../config'

import { ensureDir, emptyDir, readFile, stat, writeFile } from 'fs-extra'
import { resolve } from 'path'
import chalk from 'chalk'
import packageJson from '../../package.json'
import { collectPageData, Page } from '../collectPageData'

const toAbsolute = (path: string) => resolve(process.cwd(), path)

async function prerender() {
  try {
    const pages: Page[] = JSON.parse(
      await readFile(toAbsolute('./.wilson/tmp/page-data.json'), 'utf-8')
    )

    console.log(
      `${chalk.cyan(`wilson v${packageJson.version}`)} ${chalk.green(
        'generating static pages...'
      )}`
    )

    for (const page of pages) {
      const context = {}
      const renderFn = require(toAbsolute(
        './.wilson/tmp/server/entry-server.js'
      )).render
      const renderedHtml = await renderFn(page.url, context)
      const template = await readFile(toAbsolute('./dist/index.html'), 'utf-8')
      const html = template.replace(`<!--app-html-->`, renderedHtml)
      const filePath = toAbsolute(`./dist/${page.htmlPath}`)
      await ensureDir(filePath.replace(/\/index\.html$/, ''))
      await writeFile(filePath, html)
      const size = `${((await stat(filePath)).size / 1024).toFixed(2)}kb`
      console.log(`dist/${page.htmlPath}`, size)
    }
  } catch (e) {
    console.log(e)
  }
}

export async function generate() {
  await emptyDir(`${process.cwd()}/.wilson/tmp`)

  await collectPageData()
  const serverResult = await build(getConfig(true))
  const clientResult = await build(getConfig(false))
  await prerender()

  return [clientResult, serverResult]
}
