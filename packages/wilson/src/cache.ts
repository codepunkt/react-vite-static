import { Heading, Page } from './types'

interface PluginCache {
  pages: Map<string, Page>
  markdown: {
    toc: Map<string, Heading[]>
  }
}

const cache: PluginCache = {
  pages: new Map(),
  markdown: {
    toc: new Map(),
  },
}

export default cache
