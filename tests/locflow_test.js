import {Locflow} from '../src/locflow'

describe('Locflow', () => {
  it('is an object', () => {
    expect(Locflow).to.be.an('object')
  })

  it('has a version', () => {
    expect(Locflow.version).to.be.ok
  })

  describe('.when', () => {
    beforeEach(() => {
      Locflow.clearRoutes()
    })

    it('registers the given path and callbacks', () => {
      expect(Locflow.hasRoute('/home')).to.be.false
      Locflow.when('/home', () => {}, () => {})
      expect(Locflow.hasRoute('/home')).to.be.true
    })

    it('registers multiple routes for the callbacks', () => {
      Locflow.when(['/home', '/dashboard'], () => {}, () => {})
      expect(Locflow.hasRoute('/home')).to.be.true
      expect(Locflow.hasRoute('/dashboard')).to.be.true
    })

    it('raises an error if an empty array is given', () => {
      let bindFn = () => {
        Locflow.when([], () => {}, () => {})
      }
      expect(bindFn).to.throw(/no routes given/)
    })
  })

  describe('.visit', () => {
    it('calls the onVisit callback for the visited path', () => {
      let onVisit = sinon.spy()
      Locflow.when('/home', onVisit, () => {})
      Locflow.visit('/home')
      expect(onVisit.called).to.be.true
    })

    it('calls the onLeave callback when exiting a route', () => {
      let onLeave = sinon.spy()
      Locflow.when('/home', () => {}, onLeave)
      Locflow.visit('/home')
      Locflow.visit('/dashboard')
      expect(onLeave.called).to.be.true
    })

    it('updates the browser history', () => {
      let previousHistoryLength = window.history.length
      Locflow.visit('/home')
      expect(window.history.length).to.eq(previousHistoryLength + 1)
    })
  })
})
