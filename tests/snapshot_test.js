import {LocflowDef} from '../src/locflow'
import {Url} from '../src/url'
import * as utils from '../src/utils'

describe('Snapshot specs', () => {
  let locflow, snapshot, cache
  beforeEach(() => {
    locflow = new LocflowDef()
    snapshot = locflow.snapshot
    cache = locflow.cache
  })

  afterEach(() => {
    let insertedDivs = document.querySelectorAll('div')
    for(let i = 0; i < insertedDivs.length; i++) {
      utils.removeElement(insertedDivs[i])
    }
  })

  describe('#cachePage', () => {
    it('caches the current body associated with the current location', () => {
      expect(snapshot.cachePage()).to.be.ok
      // TODO: create a cache.countInNamespace method
      expect(cache.countInNamespace('snapshot')).to.eq(1)
      let pageID = snapshot.currentPageID()
      expect(cache.get(pageID)).to.be.ok
    })

    it('finds the current cached page by location (url)', () => {
      snapshot.cachePage()
      expect(snapshot.isCurrentPageCached()).to.be.true
      expect(snapshot.getCurrentPageCache()).to.be.ok
    })

    it('returns undefined if page is not yet cached', () => {
      expect(snapshot.isCurrentPageCached()).to.be.false
      expect(snapshot.getCurrentPageCache()).to.be.undefined
    })

    it('doesnt track changes after the page is cached', () => {
      snapshot.cachePage()
      let div = document.createElement('div')
      document.body.appendChild(div)

      let cachedBody = snapshot.getCurrentPageCache()
      expect(cachedBody).not.to.eq(document.body)
      expect(cachedBody.querySelectorAll('div')).to.have.length(0)
    })

    it('updates existing cache with new content if called multiple times', () => {
      snapshot.cachePage()
      let div = document.createElement('div')
      document.body.appendChild(div)
      snapshot.cachePage()

      // Updated the same record instead of creating a new one
      expect(cache.countInNamespace('snapshot')).to.eq(1)
      let cachedBody = snapshot.getCurrentPageCache()
      expect(cachedBody.querySelectorAll('div')).to.have.length(1)
    })
  })

  describe('#apply', () => {
    it('replaces the current body with the cached one')
  })
})