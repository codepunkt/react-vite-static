import renderToString from 'preact-render-to-string'
import { App } from './components/App'
import prepass from 'preact-ssr-prepass'

export async function render(url: string) {
  const vnode = <App url={url} />

  await prepass(vnode)
  return renderToString(vnode)
}
