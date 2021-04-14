import { hydrate } from 'preact-iso'
import { options, VNode } from 'preact'
import App from './components/app'
import { Dependencies } from 'wilson'
// import 'preact/debug'

if (process.env.NODE_ENV === 'production') {
  // @ts-ignore
  const pathPreloads = window.__WILSON_DATA__.pathPreloads as Record<
    string,
    Dependencies
  >
  const insertedPreloads: Set<string> = new Set()

  const vnodeHook = ({
    type,
    props,
  }: VNode<{
    href?: string
    target?: string
    onMouseOver?: (e: MouseEvent) => void
  }>) => {
    if (
      type === 'a' &&
      props &&
      props.href &&
      !props.href.startsWith('http') &&
      (!props.target || props.target === '_self')
    ) {
      props.onMouseOver = (e) => {
        const preloads = [
          ...(pathPreloads[props.href!] ?? { js: [] }).js,
          ...(pathPreloads[props.href!] ?? { css: [] }).css,
        ]
        preloads.forEach((href) => {
          if (!insertedPreloads.has(href)) {
            const tag = document.createElement('link')
            const isScript = href.endsWith('.js')
            tag.setAttribute('rel', isScript ? 'modulepreload' : 'preload')
            tag.setAttribute('as', isScript ? 'script' : 'style')
            tag.setAttribute('crossorigin', '')
            tag.setAttribute('href', `/${href}`)
            document.head.appendChild(tag)
            insertedPreloads.add(href)
          }
        })
      }
    }
  }

  const old = options.vnode
  options.vnode = (vnode) => {
    if (old) old(vnode)
    vnodeHook(vnode)
  }
}

hydrate(<App />, document.body)
