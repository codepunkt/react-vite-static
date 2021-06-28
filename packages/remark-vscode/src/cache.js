import manager from 'cache-manager'

const caches = new Map()

export const getCache = (name) => {
  let cache = caches.get(name)
  if (!cache) {
    cache = new Cache({ name }).init()
    caches.set(name, cache)
  }
  return cache
}

const MAX_CACHE_SIZE = 250
const TTL = Number.MAX_SAFE_INTEGER

class Cache {
  constructor({ name } = { name: 'db' }) {
    this.name = name
  }
  init() {
    this.cache = manager.multiCaching([
      manager.caching({ store: 'memory', max: MAX_CACHE_SIZE, ttl: TTL }),
    ])
    return this
  }
  async set(key, value) {
    return this.cache.set(key, value)
  }
  async get(key) {
    return this.cache.get(key)
  }
}
