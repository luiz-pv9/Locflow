import EventEmitter from 'events'
import Url from './url'
import {log} from './log'
import {Visit} from './visit'
import {Renderer} from './renderer'
import {BrowserAdapter} from './browser_adapter'
import Event from './event'
import * as utils from './utils'

const EVENT_READY = 'ready'
const EVENT_TRANSITION = 'transition'
const EVENT_BEFORE_VISIT = 'before:visit'

export class LocflowDef extends EventEmitter {
  constructor() {
    super()
    this.routes = {}
    this.handlers = []
    this.defaultRoute = {
      onVisit: function() {},
      onLeave: function() {}
    }
    this.currentRoute = null
    this.version = '0.0.1'
    this.renderer = new Renderer()
    this.adapter = new BrowserAdapter()
  }

  /*
  ** Erases all registered routes. Do not mistake for `clearHandlers`. Routes
  ** are callbacks to create the state of a page. Handlers are callbacks of
  ** notification, after the page is finished loaded in it's initial state.
  */
  clearRoutes() {
    this.routes = {}
  }

  /*
  ** Returns the route associated with the given `path`. Undefined is returned
  ** if not found.
  */
  getRoute(path) {
    return this.routes[path]
  }

  /*
  ** Returns true if the given path is registered for a route, false otherwise.
  */
  hasRoute(path) {
    return this.getRoute(path) != null
  }

  /*
  ** Locflow has two concepts: routes and handlers. Routes are functions that
  ** create the state of a page. Handlers are functions that modify interactively
  ** the page that has been loaded. The default `onVisit` and `onLeave` routes
  ** are defined in the navigation module. All the logic regarding merge
  ** headers, update HTML body, restore scroll position, etc. are implement
  ** by the onVisit and onLeave in navigation.
  */
  setDefaultRoute(onVisit, onLeave) {
    this.defaultRoute.onVisit = onVisit
    this.defaultRoute.onLeave = onLeave
  }

  /*
  ** Associates the given callbacks (onVisit and onLeave) with the given path.
  */
  route(path, onVisit, onLeave) {
    if(utils.isArray(path)) {
      if(path.length === 0) throw "empty array - no routes given"
      path.forEach(singlePath => {
        this.route(singlePath, onVisit, onLeave)
      })
      return
    }
    path = new Url(path).path
    return this.routes[path] = {
      onVisit: onVisit,
      onLeave: onLeave,
    }
  }

  /*
  ** Emits the `before:visit` event and if the user did not prevent it, calls
  ** the `onVisit` handler in the route. This function returns false if the
  ** visit action was not performed.
  */
  _visitRoute(route, url) {
    let event = new Event(EVENT_BEFORE_VISIT, { url })
    this.emit(EVENT_BEFORE_VISIT, event)
    if(event.defaultPrevented) return false
    return route.onVisit(url.path)
  }

  /* 
  ** Visits the specified path, calling the `onLeave` function for the current
  ** route.
  */
  visit(path, opts) {
    return new Visit(this, path, opts)
    
    let url = new Url(path)
    if(this.currentRoute) this.currentRoute.onLeave(url.path)
    let route = this.getRoute(url.path) || this.defaultRoute

    if(this._visitRoute(route, url) === false) return

    this.handlersFor(url.path).forEach(handler => {
      handler.callback(url.path)
    })

    this.emit(EVENT_TRANSITION, new Url(document.location).toString(), url.toString())

    this.currentRoute = route
    window.history.pushState({locflow: true}, url.path, url.path)
  }

  /*
  ** Registers a route handler for the given `path`. This handler will be called
  ** whenever the url matches the visited page.
  */
  match(path, handler) {
    let url = new Url(path)
    return this.handlers.push({ url, callback: handler })
  }

  /*
  ** Locflow calls the first handler that matches the given path, which is 
  ** correct. But the user can specify multiple handlers for the same path.
  */
  handlersFor(path) {
    let url = new Url(path)
    let firstMatch = null
    return this.handlers.filter(handler => {
      if(firstMatch) return handler.url.path === firstMatch.url.path
      if(handler.url.match(url)) {
        firstMatch = handler
        return true
      }
    })
  }

  /*
  ** Clears all handlers defined in the `match` function.
  */
  clearHandlers() {
    this.handlers.length = 0
  }
}

export const Locflow = new LocflowDef()
window.addEventListener('load', () => { Locflow.emit(EVENT_READY) })
