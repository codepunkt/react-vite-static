import { build as viteBuild } from 'vite'
import { getViteConfig, loadOptions } from '../config'
import { emptyDir } from 'fs-extra'
import { collectPageData } from '../page'
import { prerenderStaticPages } from '../prerender'
import { createOpengraphImages } from '../opengraph'

export async function build() {
  await emptyDir(`${process.cwd()}/.wilson`)
  await emptyDir(`${process.cwd()}/dist`)

  await loadOptions()
  await collectPageData()

  await viteBuild(await getViteConfig({ ssr: true }))
  await viteBuild(await getViteConfig({ ssr: false }))

  await prerenderStaticPages()
  await createOpengraphImages()
}
