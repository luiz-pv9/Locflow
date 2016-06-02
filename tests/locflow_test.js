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
      Locflow.route('/home', () => {}, () => {})
      expect(Locflow.hasRoute('/home')).to.be.true
    })

    it('registers multiple routes for the callbacks', () => {
      Locflow.route(['/home', '/dashboard'], () => {}, () => {})
      expect(Locflow.hasRoute('/home')).to.be.true
      expect(Locflow.hasRoute('/dashboard')).to.be.true
    })

    it('raises an error if an empty array is given', () => {
      let bindFn = () => {
        Locflow.route([], () => {}, () => {})
      }
      expect(bindFn).to.throw(/no routes given/)
    })
  })

  describe('.visit', () => {
    it('calls the onVisit callback for the visited path', () => {
      let onVisit = sinon.spy()
      Locflow.route('/home', onVisit, () => {})
      Locflow.visit('/home')
      expect(onVisit.called).to.be.true
    })

    it('calls the onLeave callback when exiting a route', () => {
      let onLeave = sinon.spy()
      Locflow.route('/home', () => {}, onLeave)
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

  describe('.match', () => {
    it('registers multiple handlers for a route', () => {
      Locflow.match('/home', function() {})
      expect(Locflow.handlersFor('/home')).to.have.length(1)
      Locflow.match('/home', function() {})
      expect(Locflow.handlersFor('/home')).to.have.length(2)
      Locflow.clearHandlers()
      expect(Locflow.handlersFor('/home')).to.have.length(0)
    })

    it('calls the registered handler with the visit url', () => {
      let handler = sinon.spy()
      Locflow.match('/home', handler)
      Locflow.visit('/home')
      expect(handler.called).to.be.true
    })

    it('calls the first matching url', () => {
      let handler1 = sinon.spy()
      let handler2 = sinon.spy()
      Locflow.match('/posts/:id', handler1)
      Locflow.match('/posts/latest', handler2)

      Locflow.visit('/posts/latest')
      expect(handler1.called).to.be.true
      expect(handler2.called).to.be.false
    })

    it('calls the multiple handlers for the first matching url', () => {
      let handler1 = sinon.spy(), handler2 = sinon.spy(), handler3 = sinon.spy()
      Locflow.match('/posts/:id', handler1)
      Locflow.match('/posts/:id', handler2)
      Locflow.match('/posts/latest', handler3)

      Locflow.visit('/posts/latest')
      expect(handler1.called).to.be.true
      expect(handler2.called).to.be.true
      expect(handler3.called).to.be.false
    })
  })

  describe('events', () => {
    beforeEach(() => {
      Locflow.removeAllListeners()
    })

    it('triggers `transition` event when visiting a page', () => {
      let onTransition = sinon.spy((from, to) => {
        console.log("from", from, "to", to)
        expect(from).to.be.ok
        expect(to).to.match(/about/)
        expect(to).not.to.eq(from)
      })
      Locflow.on('transition', onTransition)
      Locflow.visit('/about')
      expect(onTransition.called).to.be.true
    })

    it('triggers `before:visit` before calling the visit callback', () => {
      let onBeforeVisit = sinon.spy((ev) => {
      })
      Locflow.on('before:visit', onBeforeVisit)
      Locflow.visit('/home')
      expect(onBeforeVisit.called).to.be.true
    })

    it('prevents visit if `prevetDefault` was called', () => {
      let onBeforeVisit = sinon.spy((ev) => {
        ev.preventDefault()
      })
      let onTransition = sinon.spy()
      Locflow.on('before:visit', onBeforeVisit)
      Locflow.on('transition', onTransition)
      Locflow.visit('/home')
      expect(onBeforeVisit.called).to.be.true
      expect(onTransition.called).to.be.false
    })
  })
})
