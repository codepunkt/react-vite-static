import { extname } from 'path'
import { Dependencies } from '../types'

// @TODO: read types from updated vite version, PR #2901
// https://github.com/vitejs/vite/pull/2901
export type Manifest = Record<string, ManifestChunk>
interface ManifestChunk {
  src?: string
  file: string
  css?: string[]
  assets?: string[]
  isEntry?: boolean
  isDynamicEntry?: boolean
  imports?: string[]
  dynamicImports?: string[]
}

export const wrapManifest = (manifest: Manifest) => {
  const getJsDependencies = (paths: string[]): string[] => {
    return paths
      .map((path) => [manifest[path].file, ...(manifest[path].imports ?? [])])
      .flat()
  }

  const getCssDependencies = (paths: string[]): string[] => {
    return paths.map((path) => manifest[path].css ?? []).flat()
  }

  const getAssetDependencies = (paths: string[]): string[] => {
    return paths.map((path) => manifest[path].assets ?? []).flat()
  }

  const getPageDependencies = (
    pagePath: string,
    options: { assets: boolean } = { assets: true }
  ): Dependencies => {
    // add dependencies to sets to get rid of duplicates
    const js = new Set<string>(getJsDependencies([pagePath]))
    const css = new Set<string>(getCssDependencies([pagePath]))
    const assets = new Set<string>(getAssetDependencies([pagePath]))

    // resolve chunks without rollup facade module ids
    let length = 0
    let prevLength = 0
    do {
      prevLength = length
      const sub = Array.from(js).filter((dep) => dep.startsWith('_'))
      length = sub.length
      getJsDependencies(sub).map((j) => js.add(j))
      getCssDependencies(sub).map((c) => css.add(c))
      getAssetDependencies(sub).map((a) => assets.add(a))
    } while (length > prevLength)

    return {
      js: Array.from(js).filter(
        (dep) => !dep.startsWith('_') && extname(dep) === '.js'
      ),
      css: Array.from(css),
      ...(options.assets ? { assets: Array.from(assets) } : {}),
    }
  }

  return {
    getPageDependencies,
  }
}
