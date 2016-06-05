import {Visit} from '../src/visit'
import {LocflowDef} from '../src/locflow'
import Url from '../src/url'
const Locflow = new LocflowDef()

describe('Visit specs', () => {
  let xhr, requests
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest()
    xhr.onCreate = (req) => { requests.push(req) }
    requests = []
  })

  it('is a function class', () => {
    expect(Visit).to.be.a('function')
  })

  it('has a default action of `advance`', () => {
    let visit = Locflow.visit('/home')
    expect(visit.action).to.eq(Visit.ADVANCE)
  })

  it('has a default state of initialized', () => {
    let visit = Locflow.visit('/home')
    expect(visit.state).to.eq('initialized')
  })

  it('starts the visit with the `start` method', () => {
    let visit = Locflow.visit('/home')
    visit.start()
    expect(visit.state).to.eq('started')
  })

  it('sends a get request on the start method', () => {
    let visit = Locflow.visit('/home')
    visit.start()
    expect(requests).to.have.length(1)
    expect(requests[0].url).to.match(/\/home/)
    expect(visit.request).to.be.ok
  })

  it('abort the existing visit if a new one is requested')

  it('completes the visit with the `complete` method', () => {
    let visit = Locflow.visit('/home')
    visit.complete()
    expect(visit.state).to.eq('completed')
  })

  it('fails the visit with the `fail` method', () => {
    let visit = Locflow.visit('/home')
    visit.fail()
    expect(visit.state).to.eq('failed')
  })

  it('aborts the visit with the `abort` method', () => {
    let visit = Locflow.visit('/home')
    visit.abort()
    expect(visit.state).to.eq('aborted')
  })

  it('aborts the request if already started', () => {
    let visit = Locflow.visit('/home')
    visit.start() // sends the request
    visit.abort()
    expect(visit.state).to.eq('aborted')
    expect(visit.request.aborted).to.be.true
  })

  it('stores the time interval needed to complete the visit', (done) => {
    let visit = Locflow.visit('/home')
    visit.start()
    setTimeout(() => {
      visit.complete()
      expect(visit.duration()).to.be.at.least(5)
      done()
    }, 5)
  })

  describe('#changeHistory', () => {
    it('adds a new entry to the history if the action is `advance`', () => {
      let visit = Locflow.visit('/home', { action: 'advance' })
      let previousHistoryLength = window.history.length
      visit.changeHistory()
      expect(window.history.length).to.eq(previousHistoryLength + 1)
    })

    it('replaces the current entry if the action is `replace`', () => {
      let visit = Locflow.visit('/home', { action: 'replace' })
      let previousHistoryLength = window.history.length
      visit.changeHistory()
      expect(window.history.length).to.eq(previousHistoryLength) // keeps the same
      let currentLocation = new Url(document.location)
      expect(currentLocation.path).to.eq('/home')
    })
  })

  describe('#cachedSnapshot', () => {
    it('returns undefined if there is no cache associated with the visit location')
    it('returns the cached element')
  })

  describe('lifecycle', () => {
    it('calls visitProposed in the adapter', () => {
      Locflow.adapter.visitProposed = sinon.spy(Locflow.adapter.visitProposed)
      let visit = Locflow.visit('/home')
      expect(Locflow.adapter.visitProposed.called).to.be.true
    })

    it('calls visitRequestStarted in the adapter', () => {
      Locflow.adapter.visitRequestStarted = sinon.spy(Locflow.adapter.visitRequestStarted)
      let visit = Locflow.visit('/home')
      visit.start()
      expect(Locflow.adapter.visitRequestStarted.called).to.be.true
    })

    it('calls visitRequestAborted in the adapter', () => {
      Locflow.adapter.visitRequestAborted = sinon.spy(Locflow.adapter.visitRequestAborted)
      let visit = Locflow.visit('/home')
      visit.start()
      visit.abort()
      expect(Locflow.adapter.visitRequestAborted.called).to.be.true
    })

    it('calls visitRequestProgressed in the adapter')

    it('calls visitRequestCompleted in the adapter', () => {
      Locflow.adapter.visitRequestCompleted = sinon.spy(Locflow.adapter.visitRequestCompleted)
      let visit = Locflow.visit('/home')
      visit.start()
      requests[0].respond(200, {}, '<html></html>')
      expect(Locflow.adapter.visitRequestCompleted.called).to.be.true
    })

    it('calls visitRequestFailedWithStatusCode in the adapter', () => {
      Locflow.adapter.visitRequestFailedWithStatusCode = sinon.spy(
        Locflow.adapter.visitRequestFailedWithStatusCode
      )
      let visit = Locflow.visit('/home')
      visit.start()
      requests[0].respond(500, {}, '<html></html>')
      expect(Locflow.adapter.visitRequestFailedWithStatusCode.called).to.be.true
    })
  })
})