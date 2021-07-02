import throttle from 'throttles'
import { options, VNode } from 'preact'

import { Dependencies } from '../types'

declare global {
  interface Window {
    __WILSON_DATA__: { pathPreloads: Record<string, Dependencies> }
  }
}

interface Navigator {
  connection?: {
    effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
    saveData: boolean
  }
}

/**
 * Fetches a given URL using XMLHttpRequest
 */
const viaXHR = (url: string): Promise<unknown> => {
  return new Promise((res, rej) => {
    const req = new XMLHttpRequest()
    req.open(`GET`, url, (req.withCredentials = true))
    req.onload = () => {
      req.status === 200 ? res(req.status) : rej(req.status)
    }
    req.send()
  })
}

/**
 * Fetches a given URL using `<link rel=modulepreload>` or `<link rel=prefetch>`
 */
const viaDOM = (url: string): Promise<unknown> => {
  return new Promise((res, rej) => {
    const link = document.createElement('link')
    const isScript = url.endsWith('.js')
    link.rel = isScript ? 'modulepreload' : 'prefetch'
    link.as = isScript ? 'script' : 'style'
    link.crossOrigin = ''
    link.href = url
    link.onload = res
    link.onerror = rej
    document.head.appendChild(link)
  })
}

const prefetch = (url: string) => {
  const link = document.createElement('link')
  const hasPrefetch =
    link.relList && link.relList.supports && link.relList.supports('prefetch')
  return hasPrefetch ? viaDOM(url) : viaXHR(url)
}

type PrefetchOptions = {
  throttle?: number
}

/**
 * Enables prefetch of relative link resources on focus and mouseOver
 * by injecting modulepreload/preload links into the <head>
 *
 * @todo check which options from quicklink might be worthwhile to have
 * and decide whether or not to differentiate between intersectionobserver,
 * onFocus and onMouseOver prefetching
 */
export const enablePrefetch = (options: PrefetchOptions): void => {
  const [toAdd, isDone] = throttle(3)
  const pathPreloads = (window.__WILSON_DATA__ ?? {}).pathPreloads

  /**
   * An array of relative script and style URLs
   */
  const assets = new Set(
    Array.from(
      document.querySelectorAll(
        'head link[rel=stylesheet], head link[rel=preload], head link[rel=modulepreload], head script[src]'
      )
    )
      .map((e) => {
        return e.getAttribute(
          e.tagName.toLowerCase() === 'script' ? 'src' : 'href'
        )
      })
      .filter(Boolean)
  )

  const vnodeHook = ({
    type,
    props,
  }: VNode<{
    href?: string
    target?: string
    onMouseOver?: (e: MouseEvent) => void
    onFocus?: (e: FocusEvent) => void
  }>) => {
    const handleInteraction = () => {
      const preloads = [
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...(pathPreloads[props.href!] ?? { js: [] }).js,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...(pathPreloads[props.href!] ?? { css: [] }).css,
      ]
      preloads.forEach((href) => {
        const url = `/${href}`

        // Don't prefetch if using 2G or if saveData is enabled
        const conn = (navigator as Navigator).connection
        if (conn && (conn.saveData || /2g/.test(conn.effectiveType))) {
          return
        }

        // Don't prefetch if asset was already fetched or prefetched
        if (assets.has(href)) {
          return
        }

        assets.add(href)
        toAdd(async () => {
          await prefetch(url)
          isDone()
        })
      })
    }

    // if node is relative link opened in same tab
    if (
      type === 'a' &&
      props &&
      props.href &&
      !props.href.startsWith('http') &&
      (!props.target || props.target === '_self')
    ) {
      props.onMouseOver = handleInteraction
      props.onFocus = handleInteraction
    }
  }

  // define VNode option hook
  // @see https://preactjs.com/guide/v10/options/
  const old = options.vnode
  options.vnode = (vnode) => {
    if (old) old(vnode)
    vnodeHook(vnode)
  }
}
