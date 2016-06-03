import {Visit} from '../src/visit'
import {LocflowDef} from '../src/locflow'
import Url from '../src/url'
const Locflow = new LocflowDef()

describe('Visit specs', () => {
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
    it('calls visitProposed in the adapter')
    it('calls visitRequestStarted in the adapter')
    it('calls visitRequestProgressed in the adapter')
    it('calls visitRequestCompleted in the adapter')
    it('calls visitCompleted in the adapter')
    it('calls visitRequestFailedWithStatusCode in the adapter')
  })
})