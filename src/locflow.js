import EventEmitter from 'events'
import Url from './url'
import {log} from './log'
import Event from './event'
import * as utils from './utils'

const EVENT_READY = 'ready'
const EVENT_TRANSITION = 'transition'
const EVENT_BEFORE_VISIT = 'before:visit'

export const Locflow = new EventEmitter() 
Locflow.version = '0.0.1'

// Map of all user registered routes.
let routes = {}

/*
** Stores all user handlers for routes in this application.
*/
let handlers = []

let defaultRoute = {
  onVisit: () => {
    log("default onVisit called. You should probably override this.")
  },
  onLeave: () => {
    log("default onLeave called. You should probably override this.")
  }
}

let currentRoute = null

window.addEventListener('load', () => { Locflow.emit(EVENT_READY) })

/*
** Erases all registered routes. Do not mistake for `clearHandlers`. Routes
** are callbacks to create the state of a page. Handlers are callbacks of
** notification, after the page is finished loaded in it's initial state.
*/
Locflow.clearRoutes = function() {
  routes = {}
}

/*
** Returns the route associated with the given `path`. Undefined is returned
** if not found.
*/
Locflow.getRoute = function(path) {
  return routes[path]
}

/*
** Returns true if the given path is registered for a route, false otherwise.
*/
Locflow.hasRoute = function(path) {
  return Locflow.getRoute(path) != null
}

/*
** Locflow has two concepts: routes and handlers. Routes are functions that
** create the state of a page. Handlers are functions that modify interactively
** the page that has been loaded. The default `onVisit` and `onLeave` routes
** are defined in the navigation module. All the logic regarding merge
** headers, update HTML body, restore scroll position, etc. are implement
** by the onVisit and onLeave in navigation.
*/
Locflow.setDefaultRoute = function(onVisit, onLeave) {
  defaultRoute.onVisit = onVisit
  defaultRoute.onLeave = onLeave
}

/*
** Associates the given callbacks (onVisit and onLeave) with the given path.
*/
Locflow.route = function(path, onVisit, onLeave) {
  if(utils.isArray(path)) {
    if(path.length === 0) throw "empty array - no routes given"
    path.forEach(singlePath => {
      Locflow.route(singlePath, onVisit, onLeave)
    })
    return
  }
  path = new Url(path).path
  return routes[path] = {
    onVisit: onVisit,
    onLeave: onLeave,
  }
}

/*
** Emits the `before:visit` event and if the user did not prevent it, calls
** the `onVisit` handler in the route. This function returns false if the
** visit action was not performed.
*/
function visitRoute(route, url) {
  let event = new Event(EVENT_BEFORE_VISIT, { url })
  Locflow.emit(EVENT_BEFORE_VISIT, event)
  if(event.defaultPrevented) return false
  return route.onVisit(url.path)
}

/* 
** Visits the specified path, calling the `onLeave` function for the current
** route.
*/
Locflow.visit = function(path) {
  let url = new Url(path)
  if(currentRoute) currentRoute.onLeave(url.path)
  let route = Locflow.getRoute(url.path) || defaultRoute

  if(visitRoute(route, url) === false) return

  Locflow.handlersFor(url.path).forEach(handler => {
    handler.callback(url.path)
  })

  Locflow.emit(EVENT_TRANSITION, new Url(document.location).toString(), url.toString())

  currentRoute = route
  window.history.pushState({locflow: true}, url.path, url.path)
}

/*
** Registers a route handler for the given `path`. This handler will be called
** whenever the url matches the visited page.
*/
Locflow.match = function(path, handler) {
  let url = new Url(path)
  return handlers.push({ url, callback: handler })
}

/*
** Locflow calls the first handler that matches the given path, which is 
** correct. But the user can specify multiple handlers for the same path.
*/
Locflow.handlersFor = function(path) {
  let url = new Url(path)
  let firstMatch = null
  return handlers.filter(handler => {
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
Locflow.clearHandlers = function() {
  handlers.length = 0
}