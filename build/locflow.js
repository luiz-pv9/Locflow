(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
'use strict';

/*
** Receives a query string in the argument and returns a Json object that maps
** from keys to values present in the query. If the same key appears multiple
** times in the query, an array of all values are used. For example:
**
** 'color=blue&color=red' // => { 'color': ['blue', 'red'] }
**
** Nested properties are kept the same way they appear in the query string:
** If you want nested properties see the function encodeQueryStringToNestedJson.
**
** 'person[name]=luiz&person[age]=10' // => { 'person[name]': 'luiz', 'person[age]': '10' }
*/

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.encodeQueryStringToFlatJson = function (query) {
  if (query === '') return {};
  var parts = query.replace('?', '').split('&');
  var obj = {};
  var possibleArrays = [];
  parts.forEach(function (part) {
    var vals = part.split('=');
    if (vals.length !== 2) return;
    var key = vals[0];
    var value = vals[1];

    if (key.match(/\[\]$/)) {
      key = key.replace(/\[\]$/, '');
    }

    if (obj[key]) {
      // The previous value could already be an array, in which case we
      // just skip it.
      if ('[object Array]' != Object.prototype.toString.call(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  });
  return obj;
};

/*
** Similar to encodeQueryStringToFlatJson but properties described using
** brackets notation are inserted in nested objects. For example, the 
** following queryString: "post[author][name]=Luiz"
** would be encoded as: "{ post: { author: { name: "Luiz" } } }"
*/
exports.encodeQueryStringToNestedJson = function (query) {
  if (query === '') return {};
  var parts = query.replace('?', '').split('&');
  var obj = {};
  parts.forEach(function (part) {
    var vals = part.split('=');
    if (vals.length !== 2) return;
    var key = vals[0];
    var value = vals[1];
    var objRef = obj;

    if (key.match(/\[\]$/)) {
      key = key.replace(/\[\]$/, '');
    }

    var keyParts = key.split('[').map(function (keyPart) {
      return keyPart.replace(']', '');
    });
    keyParts.forEach(function (keyPart, index) {
      if (index < keyParts.length - 1) {
        objRef[keyPart] = objRef[keyPart] || {};
        objRef = objRef[keyPart];
      } else {
        key = keyPart;
      }
    });
    if (objRef[key]) {
      // The previous value could already be an array, in which case we
      // just skip it.
      if ('[object Array]' != Object.prototype.toString.call(objRef[key])) {
        objRef[key] = [objRef[key]];
      }
      objRef[key].push(value);
    } else {
      objRef[key] = value;
    }
  });
  return obj;
};

/*
** Encodes the specified JSON object to query string. This function is used by
** the Url when encoding the query part of the url and for serializing forms
** back to www-form-urlencoded to send in a post request. Here are a few
** examples:
**
** ```javascript
** encodeJsonToQueryString({ 'foo': 'bar' }) // => 'foo=bar'
** encodeJsonToQueryString({ 'test': [1, 2] }) // => 'test[0]=1&test[1]=2'
** encodeJsonToQueryString({ 'author': { 'name': 'Luiz', 'age': '22' } }) // => 'author[name]=Luiz&author[age]=22'
** encodeJsonToQueryString({ 'colors': { 'cold': ['blue', 'white'] } }) // => 'colors[cold][0]=blue&colors[cold][1]=white'
** ```
*/
exports.encodeJsonToQueryString = function (data) {
  var qs = '';
  var keys = Object.keys(data);

  var valueString = function valueString(key, value) {
    if (Object.prototype.toString.call(value) === '[object Object]') {
      var _ret = function () {
        var qs = '';
        var subkeys = Object.keys(value);
        subkeys.forEach(function (subkey, index) {
          qs += valueString(key + '[' + subkey + ']', value[subkey]);
          if (index < subkeys.length - 1) qs += '&';
        });
        return {
          v: qs
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else if (Object.prototype.toString.call(value) === '[object Array]') {
      var _qs = '';
      value.forEach(function (item, index) {
        _qs += key + '[]=' + item;
        if (index < value.length - 1) _qs += '&';
      });
      return _qs;
    } else {
      return key + '=' + value;
    }
  };

  keys.forEach(function (key, index) {
    var val = data[key];
    qs += valueString(key, val);
    if (index < keys.length - 1) qs += '&';
  });
  return qs;
};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
** The `Event` class implements a very small subset of browser's native
** CustomEvent.
*/

var Event = function () {
  function Event(name, data) {
    _classCallCheck(this, Event);

    this.name = name;
    this.timestamp = new Date();
    this.data = data || {};
    this.defaultPrevented = false;
  }

  _createClass(Event, [{
    key: "preventDefault",
    value: function preventDefault() {
      this.defaultPrevented = true;
    }
  }]);

  return Event;
}();

exports.default = Event;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Locflow = exports.LocflowDef = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _url = require('./url');

var _url2 = _interopRequireDefault(_url);

var _log = require('./log');

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EVENT_READY = 'ready';
var EVENT_TRANSITION = 'transition';
var EVENT_BEFORE_VISIT = 'before:visit';

var LocflowDef = exports.LocflowDef = function (_EventEmitter) {
  _inherits(LocflowDef, _EventEmitter);

  function LocflowDef() {
    _classCallCheck(this, LocflowDef);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LocflowDef).call(this));

    _this.routes = {};
    _this.handlers = [];
    _this.defaultRoute = {
      onVisit: function onVisit() {},
      onLeave: function onLeave() {}
    };
    _this.currentRoute = null;
    _this.version = '0.0.1';
    return _this;
  }

  /*
  ** Erases all registered routes. Do not mistake for `clearHandlers`. Routes
  ** are callbacks to create the state of a page. Handlers are callbacks of
  ** notification, after the page is finished loaded in it's initial state.
  */


  _createClass(LocflowDef, [{
    key: 'clearRoutes',
    value: function clearRoutes() {
      this.routes = {};
    }

    /*
    ** Returns the route associated with the given `path`. Undefined is returned
    ** if not found.
    */

  }, {
    key: 'getRoute',
    value: function getRoute(path) {
      return this.routes[path];
    }

    /*
    ** Returns true if the given path is registered for a route, false otherwise.
    */

  }, {
    key: 'hasRoute',
    value: function hasRoute(path) {
      return this.getRoute(path) != null;
    }

    /*
    ** Locflow has two concepts: routes and handlers. Routes are functions that
    ** create the state of a page. Handlers are functions that modify interactively
    ** the page that has been loaded. The default `onVisit` and `onLeave` routes
    ** are defined in the navigation module. All the logic regarding merge
    ** headers, update HTML body, restore scroll position, etc. are implement
    ** by the onVisit and onLeave in navigation.
    */

  }, {
    key: 'setDefaultRoute',
    value: function setDefaultRoute(onVisit, onLeave) {
      this.defaultRoute.onVisit = onVisit;
      this.defaultRoute.onLeave = onLeave;
    }

    /*
    ** Associates the given callbacks (onVisit and onLeave) with the given path.
    */

  }, {
    key: 'route',
    value: function route(path, onVisit, onLeave) {
      var _this2 = this;

      if (utils.isArray(path)) {
        if (path.length === 0) throw "empty array - no routes given";
        path.forEach(function (singlePath) {
          _this2.route(singlePath, onVisit, onLeave);
        });
        return;
      }
      path = new _url2.default(path).path;
      return this.routes[path] = {
        onVisit: onVisit,
        onLeave: onLeave
      };
    }

    /*
    ** Emits the `before:visit` event and if the user did not prevent it, calls
    ** the `onVisit` handler in the route. This function returns false if the
    ** visit action was not performed.
    */

  }, {
    key: '_visitRoute',
    value: function _visitRoute(route, url) {
      var event = new _event2.default(EVENT_BEFORE_VISIT, { url: url });
      this.emit(EVENT_BEFORE_VISIT, event);
      if (event.defaultPrevented) return false;
      return route.onVisit(url.path);
    }

    /* 
    ** Visits the specified path, calling the `onLeave` function for the current
    ** route.
    */

  }, {
    key: 'visit',
    value: function visit(path, opts) {
      var url = new _url2.default(path);
      if (this.currentRoute) this.currentRoute.onLeave(url.path);
      var route = this.getRoute(url.path) || this.defaultRoute;

      if (this._visitRoute(route, url) === false) return;

      this.handlersFor(url.path).forEach(function (handler) {
        handler.callback(url.path);
      });

      this.emit(EVENT_TRANSITION, new _url2.default(document.location).toString(), url.toString());

      this.currentRoute = route;
      window.history.pushState({ locflow: true }, url.path, url.path);
    }

    /*
    ** Registers a route handler for the given `path`. This handler will be called
    ** whenever the url matches the visited page.
    */

  }, {
    key: 'match',
    value: function match(path, handler) {
      var url = new _url2.default(path);
      return this.handlers.push({ url: url, callback: handler });
    }

    /*
    ** Locflow calls the first handler that matches the given path, which is 
    ** correct. But the user can specify multiple handlers for the same path.
    */

  }, {
    key: 'handlersFor',
    value: function handlersFor(path) {
      var url = new _url2.default(path);
      var firstMatch = null;
      return this.handlers.filter(function (handler) {
        if (firstMatch) return handler.url.path === firstMatch.url.path;
        if (handler.url.match(url)) {
          firstMatch = handler;
          return true;
        }
      });
    }

    /*
    ** Clears all handlers defined in the `match` function.
    */

  }, {
    key: 'clearHandlers',
    value: function clearHandlers() {
      this.handlers.length = 0;
    }
  }]);

  return LocflowDef;
}(_events2.default);

var Locflow = exports.Locflow = new LocflowDef();
window.addEventListener('load', function () {
  Locflow.emit(EVENT_READY);
});

},{"./event":3,"./log":5,"./url":6,"./utils":7,"events":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
/*
** Custom 'log' function for Locflow. It just adds a nice [Locflow] before
** the given arguments.
*/
function log() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[Locflow]');
  console.log.apply(console, args);
}

},{}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var encoding = require('./encoding');

var Url = function () {

  /*
  ** Initializes internal attributes with the specified url. The url might be
  ** a string, document.location object or another instance of Url.
  ** - If no protocol is provided, the current protocol is used.
  ** - If no domain is provided, the current domain is used.
  ** - If no path is provided, "/" is used.
  ** - If no port is provided, 80 is used.
  */

  function Url(url) {
    _classCallCheck(this, Url);

    if (url instanceof Url) {
      this.copyFromUrl(url);
    } else if (url && url.host && url.pathname) {
      this.copyFromLocation(url);
    } else if ('string' === typeof url) {
      this.initializeFromString(url);
    } else {
      console.error("invalid url: " + url);
    }
  }

  /*
  ** Called by the constructor when the specified argument is an instance of
  ** the Url class. All values are copied from the other url.
  */


  _createClass(Url, [{
    key: 'copyFromUrl',
    value: function copyFromUrl(url) {
      this.protocol = url.protocol;
      this.domain = url.domain;
      this.query = url.query;
      this.path = url.path;
      this.port = url.port;
      this.hash = url.hash;
    }

    /*
    ** Called by the constructor when the specified argument is of the type
    ** document.location. All values are copied from the specified location.
    */

  }, {
    key: 'copyFromLocation',
    value: function copyFromLocation(location) {
      this.protocol = location.protocol.replace(':', '');
      this.domain = location.host;
      this.query = location.search;
      this.path = location.pathname;
      this.port = location.port;
      this.hash = location.hash;
      if (this.domain.indexOf(':') !== -1) {
        this.domain = this.domain.split(':')[0];
      }
    }

    /*
    ** Called by the constructor when the specified argument is a string.
    */

  }, {
    key: 'initializeFromString',
    value: function initializeFromString(url) {
      var regex = /(file|http[s]?:\/\/)?([^\/?#]*)?([^?#]*)([^#]*)([\s\S]*)/i;
      var matches = url.match(regex);
      if (matches) {
        this.protocol = (matches[1] || '').replace('://', '');
        this.domain = matches[2] || '';
        this.path = matches[3];
        this.query = matches[4];
        this.hash = matches[5];
        this.port = '';
        if (this.domain.indexOf(':') !== -1) {
          var parts = this.domain.split(':');
          this.domain = parts[0];
          this.port = parts[1];
        }
      } else {
        console.error('invalid url: ' + url);
      }
    }

    /*
    ** Returns this url as a string. This method fills the void with the current
    ** page location data if the user doesn't specify one. This prevents
    ** duplicating the same key for caches.
    */

  }, {
    key: 'toString',
    value: function toString() {
      var urlStr = '';
      urlStr += this.protocol ? this.protocol + '://' : document.location.protocol + '//';
      urlStr += this.domain ? this.domain : document.location.host;
      urlStr += this.port ? ':' + this.port : '';
      return urlStr + (this.path || '/') + this.query + this.hash;
    }

    /*
    ** Instantiates a new url with the same properties as this but without the
    ** hash part. This is useful for storing reference to cache because the
    ** hash doesn't change the url id.
    */

  }, {
    key: 'withoutHash',
    value: function withoutHash() {
      var hashless = new Url(this);
      hashless.hash = '';
      return hashless;
    }

    /*
    ** Returns a hash map that maps from key -> value for each query parameter
    ** in the Url. For example: '?name=foo&age=10' would result in the map:
    ** { 'name': 'foo', 'age': '10' }. All values are treated as strings.
    */

  }, {
    key: 'queryObject',
    value: function queryObject() {
      return encoding.encodeQueryStringToNestedJson(this.query);
    }

    /*
    ** Overrides the query part of the url with the specified object. The object
    ** must be 'encodable' to queryString, so pretty much a JSON without
    ** circular reference. `this` is returned.
    */

  }, {
    key: 'setQueryObject',
    value: function setQueryObject(params) {
      this.query = '?' + encoding.encodeJsonToQueryString(params);
      return this;
    }

    /*
    ** Returns associated named params (truthy) if this url matches the given 
    ** url, false otherwise. Urls are matched considering only the path, with
    ** possible params specified with the ':' character. For example,
    ** '/users/:id' will match '/users/10' returning the object { id: '10'}.
    */

  }, {
    key: 'match',
    value: function match(url) {
      var pathRegex = this.path;
      var matches = pathRegex.match(/:[^\/]+/g);
      if (!matches) return this.path == url.path;
      matches.forEach(function (match) {
        pathRegex = pathRegex.replace(match, "([^\/]+)");
      });
      pathRegex = '^' + pathRegex.replace('/', '\/') + '$';
      var pathMatch = url.path.match(new RegExp(pathRegex));
      if (pathMatch) {
        var _ret = function () {
          var namedParams = {};
          matches.forEach(function (match, index) {
            match = match.replace(':', '');
            namedParams[match] = pathMatch[index + 1];
          });
          return {
            v: namedParams
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
      return false;
    }
  }]);

  return Url;
}();

module.exports = Url;

},{"./encoding":2}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mergeObjects = mergeObjects;
exports.stringToElements = stringToElements;
exports.isElement = isElement;
exports.isArray = isArray;
exports.isString = isString;
exports.isObject = isObject;
exports.extractBody = extractBody;
exports.findElementByAttribute = findElementByAttribute;
exports.hideElement = hideElement;
exports.removeElement = removeElement;
exports.extractAndUpdateTitle = extractAndUpdateTitle;
/*
** Copies the properties in the first and second object to a third object. The
** specified objects are not modified. If both objects have the same key, the
** value from the first object will override the second.
*/
function mergeObjects(first, secnd) {
    var merged = {};
    for (var attr in secnd) {
        merged[attr] = secnd[attr];
    }
    for (var attr in first) {
        merged[attr] = first[attr];
    }
    return merged;
}

/*
** Creates a new in-memory DOM elements from the specified html.
*/
function stringToElements(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.childNodes;
}

/*
** Returns true if the specified argument is a DOM element and false if not.
** Extract from underscore's isElement function.
*/
function isElement(arg) {
    return !!(arg && arg.nodeType === 1);
}

/*
** Returns true if the given argument is an array, false otherwise.
*/
function isArray(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
}

/*
** Returns true if the specified argument is a string and false if not.
*/
function isString(arg) {
    return '[object String]' === Object.prototype.toString.call(arg);
}

/*
** Returns true if the given argument is an object, false otherwise.
*/
function isObject(arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
}

/*
** Returns the content inside the body tag in the specified html snippet. An
** empty string is returned if the body couldn't be found.
*/
function extractBody(html) {
    var matches = /<body[\s\S]*?>([\s\S]*?)<\/body>/i.exec(html);
    if (matches && matches[1]) {
        return matches[1];
    }
    return "";
}

/*
** Iterates through the specified elements trying to find by the attribute.
*/
function findElementByAttribute(elements, attribute, value) {
    for (var i = 0, len = elements.length; i < len; i++) {
        var elm = elements[i];
        if (elm.hasAttribute && elm.hasAttribute(attribute)) {
            if (value) {
                if (elm.getAttribute(attribute) === value) {
                    return elm;
                }
            } else {
                return elm;
            }
        }
        if (elm.querySelector) {
            var selector = void 0;
            if (value) {
                selector = '*[' + attribute + '="' + value + '"]';
            } else {
                selector = '*[' + attribute + ']';
            }
            var found = elm.querySelector(selector);
            if (found) return found;
        }
    }
}

/*
** Hides the specified element setting the display property to none. Just that.
*/
function hideElement(elm) {
    if (elm && elm.style) elm.style.display = 'none';
}

/*
** Removes the given `elm` from the parent if elm is valid and has a parentNode.
*/
function removeElement(elm) {
    if (elm && elm.parentNode) elm.parentNode.removeChild(elm);
}

/*
** Receives html snippet the server responded 
*/
function extractAndUpdateTitle(html) {
    var matches = /<title[\s\S]*?>(.*?)<\/title>/i.exec(html);
    if (matches && matches[1]) {
        document.title = matches[1];
    }
}

},{}]},{},[4]);
