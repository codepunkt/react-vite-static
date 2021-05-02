import { createServer as createViteServer } from 'vite'
import { getViteConfig } from '../vite'
import { emptyDir } from 'fs-extra'
import { readPagesources } from '../state'

export async function startDevServer(
  root: string = process.cwd()
): Promise<void> {
  await emptyDir(`${root}/.wilson`)
  await readPagesources(`${root}/src/pages`)

  const config = await getViteConfig({ ssr: false })
  const devServer = await createViteServer(config)

  await devServer.listen()
}
