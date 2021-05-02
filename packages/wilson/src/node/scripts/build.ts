import { build as viteBuild } from 'vite'
import { emptyDir } from 'fs-extra'
import { getViteConfig } from '../vite'
import { prerenderStaticPages } from '../prerender'
import { createOpengraphImages } from '../opengraph'
import { readPagesources } from '../state'

export async function build(root: string = process.cwd()) {
  await emptyDir(`${process.cwd()}/.wilson`)
  await emptyDir(`${process.cwd()}/dist`)
  await readPagesources(`${root}/src/pages`)

  await viteBuild(await getViteConfig({ ssr: true }))
  await viteBuild(await getViteConfig({ ssr: false }))

  await prerenderStaticPages()
  await createOpengraphImages()
}
