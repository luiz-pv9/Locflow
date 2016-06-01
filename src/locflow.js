import EventEmitter from 'events'
import Url from './url'
import {log} from './log'
import * as utils from './utils'

const EVENT_READY = 'ready'

export const Locflow = new EventEmitter() 
Locflow.version = '0.0.1'

// Map of all user registered routes.
let routes = {}

let defaultRoute = {
  onVisit: () => {
    log("default onVisit called. You should probably override this.")
  },
  onLeave: () => {
    log("default onLeave called. You should probably override this.")
  }
}

let currentRoute = null

window.addEventListener('load', () => {
  Locflow.emit(EVENT_READY)
})

// Erases all registered routes
Locflow.clearRoutes = function() {
  routes = {}
}

Locflow.getRoute = function(path) {
  return routes[path]
}

/*
** Returns true if the given path is registered for a route, false otherwise.
*/
Locflow.hasRoute = function(path) {
  return Locflow.getRoute(path) != null
}

Locflow.setDefaultHandler = function(onVisit, onLeave) {
  defaultRoute.onVisit = onVisit
  defaultRoute.onLeave = onLeave
}

/*
** Associates the given callbacks (onVisit and onLeave) with the given path.
*/
Locflow.when = function(path, onVisit, onLeave) {
  if(utils.isArray(path)) {
    if(path.length === 0) throw "empty array - no routes given"
    path.forEach(singlePath => {
      Locflow.when(singlePath, onVisit, onLeave)
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
** Visits the specified path, calling the `onLeave` function for the current
** route.
*/
Locflow.visit = function(path) {
  path = new Url(path).path
  if(currentRoute) currentRoute.onLeave(path)
  let route = Locflow.getRoute(path) || defaultRoute
  route.onVisit(path)
  currentRoute = route
  window.history.pushState({locflow: true}, path, path)
}
