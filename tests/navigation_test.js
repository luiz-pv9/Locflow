import {Navigation} from '../src/navigation'
import {LocflowDef} from '../src/locflow'

// Create our own Locflow isolated version :)
const Locflow = new LocflowDef()

describe('Navigation specs', () => {
  let xhr, requests

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest()
    xhr.onCreate = (req) => { 
      requests.push(req)
    }
    requests = []
    Locflow.setDefaultRoute(Navigation.onVisit, Navigation.onLeave)
  })

  describe('onVisit', () => {
    it('sends a get request to the given url', () => {
      Locflow.visit('/home')
      expect(requests.length).to.eq(1)
      expect(requests[0].url).to.eq('/home')
    })

    it('merges meta tags the response header to the current header', () => {
      Locflow.visit('/home')
      requests[0].respond(200, {}, `
        <html>
          <head>
            <meta name="my-tag" content="my-content" />
            <meta name="my-other-tag" content="my-other-content" />
          </head>
          <body>
          </body>
        </html>
      `)
      let metaTags = document.getElementsByTagName('meta')
    })

    it('updates the title of the page from the <title> tag')
    it('throws an error if the element with `data-permanent` doesnt have an id')
    it('copies elements with `data-permanent` attribute to the new page')
    it('prioritizes user-define routes')
  })
})
