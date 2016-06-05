import Url from './url'

export class Snapshot {
  constructor(cache, renderer) {
    this.cache = cache
    this.renderer = renderer
  }

  cachePage() {
    let clonedBody = this.renderer.cloneBody()
    return this.cache.set(this.currentPageID(), clonedBody)
  }

  currentPageID() {
    return 'snapshot.' + new Url(document.location).toString()
  }

  isCurrentPageCached() {
    return this.getCurrentPageCache() != null
  }

  getCurrentPageCache() {
    return this.cache.get(this.currentPageID())
  }
}