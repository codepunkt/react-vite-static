import { UserConfig as ViteUserConfig } from 'vite'
import prefresh from '@prefresh/vite'
import { toRoot } from './util'
import markdownPlugin from './plugins/markdown'
import virtualPlugin from './plugins/virtual'
import pagesPlugin from './plugins/pages'
import indexHtmlPlugin from './plugins/indexHtml'
import { SiteData, UserConfig } from './types'

export type OptionsWithDefaults = UserConfig &
  Required<Pick<UserConfig, 'pageLayouts' | 'opengraphImage'>>

let options: OptionsWithDefaults

export const loadOptions = async (): Promise<OptionsWithDefaults> => {
  const userConfig = require(toRoot('wilson.config.js'))

  options = {
    ...userConfig,
    pageLayouts: userConfig.pageLayouts ?? [
      {
        pattern: '**/*.md',
        component: 'markdown',
      },
    ],
  }

  return options as OptionsWithDefaults
}

export const getOptions = () => {
  if (!options) {
    throw new Error('run loadOptions before you use getOptions!')
  }
  return options
}

interface ViteConfigOptions {
  /**
   * Produce SSR-oriented build
   */
  ssr?: boolean
}

// @TODO: check https://github.com/small-tech/vite-plugin-sri. does this tamper with splitting?
export const getViteConfig = async ({
  ssr = false,
}: ViteConfigOptions): Promise<ViteUserConfig> => {
  return {
    optimizeDeps: {
      include: ['preact', 'preact-iso'],
    },
    clearScreen: false,
    plugins: [
      await virtualPlugin(),
      await indexHtmlPlugin(),
      await markdownPlugin(),
      await pagesPlugin(),
      prefresh({}),
    ],
    build: {
      ssr,
      outDir: ssr ? '.wilson/ssr' : 'dist',
      // inline async chunk css
      cssCodeSplit: true,
      // TODO: asset inlining doesn't work? check how vite/vitepress do it for vue
      assetsInlineLimit: 409600000,
      rollupOptions: {
        // important so that each page chunk and the index export things for each other
        preserveEntrySignatures: 'allow-extension',
        input: ssr ? 'src/entry-server.tsx' : 'index.html',
      },
      manifest: ssr ? false : true,
      minify: ssr ? false : !process.env.DEBUG,
    },
    esbuild: {
      jsxInject: `import { h, Fragment } from 'preact'`,
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
  }
}

import { resolve } from 'path'
import { pathExists } from 'fs-extra'

export async function resolveUserConfig(
  root: string = process.cwd()
): Promise<UserConfig> {
  const configPath = resolve(root, 'wilson.config.js')
  const hasUserConfig = await pathExists(configPath)

  if (!hasUserConfig) {
    throw new Error(`no userconfig found.`)
  }

  // always delete cache first before loading config
  delete require.cache[configPath]

  const userConfig: UserConfig = require(configPath)
  return userConfig
}

export async function resolveSiteData(
  root: string = process.cwd()
): Promise<SiteData> {
  const userConfig = await resolveUserConfig(root)
  return {
    ...userConfig.siteData,
  }
}
