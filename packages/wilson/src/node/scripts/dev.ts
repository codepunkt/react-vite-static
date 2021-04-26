import { createServer as createViteServer } from 'vite'
import { getViteConfig } from '../vite'
import { emptyDir } from 'fs-extra'

export async function startDevServer(root: string = process.cwd()) {
  await emptyDir(`${process.cwd()}/.wilson`)

  const config = await getViteConfig({ ssr: false })
  const devServer = await createViteServer(config)

  await devServer.listen()
}
