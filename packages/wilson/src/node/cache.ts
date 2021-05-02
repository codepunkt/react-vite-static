import { Heading, Page } from '../types'

interface PluginCache {
  pages: Page[]
  markdown: {
    toc: Map<string, Heading[]>
  }
}

const cache: PluginCache = {
  pages: [],
  markdown: {
    toc: new Map(),
  },
}

export default cache
