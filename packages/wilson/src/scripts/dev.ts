import { collectPageData } from '../page'
import { createServer as createViteServer } from 'vite'
import { getViteConfig, loadOptions } from '../config'
import { emptyDir } from 'fs-extra'

export async function startDevServer(root: string = process.cwd()) {
  // possible validations
  // - tsx pages don't have a default export
  // - tsx pages export Page
  await emptyDir(`${process.cwd()}/.wilson`)

  await loadOptions()
  await collectPageData()

  const config = await getViteConfig({ ssr: false })

  const devServer = await createViteServer(config)
  await devServer.listen()
}
