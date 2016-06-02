import {Navigation} from '../src/navigation'
import {Locflow} from '../src/locflow'

describe('Navigation specs', () => {
  let xhr, requests

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest()
    xhr.onCreate = (req) => { requests.push(req) }
    requests = []
    Locflow.setDefaultRoute(Navigation.onVisit, Navigation.onLeave)
  })

  describe('onVisit', () => {
    it('sends a get request to the given url', () => {
      Locflow.visit('/home')
      expect(requests.length).to.eq(1)
      expect(requests[0].url).to.eq('/home')
    })

    it('merges the response header to the current header')
    it('adds new `link` tags to the header')
    it('adds new `script` tags to the header')
    it('throws an error if the element with `data-permanent` doesnt have an id')
    it('copies elements with `data-permanent` attribute to the new page')

    it('prioritizes user-define routes')
  })
})
