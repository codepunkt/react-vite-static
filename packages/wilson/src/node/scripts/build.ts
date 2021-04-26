import { build as viteBuild } from 'vite'
import { emptyDir } from 'fs-extra'
import { getViteConfig } from '../vite'
import { prerenderStaticPages } from '../prerender'
import { createOpengraphImages } from '../opengraph'

export async function build() {
  await emptyDir(`${process.cwd()}/.wilson`)
  await emptyDir(`${process.cwd()}/dist`)

  await viteBuild(await getViteConfig({ ssr: true }))
  await viteBuild(await getViteConfig({ ssr: false }))

  await prerenderStaticPages()
  await createOpengraphImages()
}
