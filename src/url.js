'use strict'

const encoding = require('./encoding')

class Url {

  /*
  ** Initializes internal attributes with the specified url. The url might be
  ** a string, document.location object or another instance of Url.
  ** - If no protocol is provided, the current protocol is used.
  ** - If no domain is provided, the current domain is used.
  ** - If no path is provided, "/" is used.
  ** - If no port is provided, 80 is used.
  */
  constructor(url) {
    if(url instanceof Url) {
      this.copyFromUrl(url)
    } else if(url && url.host && url.pathname) {
      this.copyFromLocation(url)
    } else if('string' === typeof url) {
      this.initializeFromString(url)
    } else {
      console.error("invalid url: " + url)
    }
  }

  /*
  ** Called by the constructor when the specified argument is an instance of
  ** the Url class. All values are copied from the other url.
  */
  copyFromUrl(url) {
    this.protocol = url.protocol;
    this.domain   = url.domain;
    this.query    = url.query;
    this.path     = url.path;
    this.port     = url.port;
    this.hash     = url.hash;
  }

  /*
  ** Called by the constructor when the specified argument is of the type
  ** document.location. All values are copied from the specified location.
  */
  copyFromLocation(location) {
    this.protocol = location.protocol.replace(':', '');
    this.domain   = location.host;
    this.query    = location.search;
    this.path     = location.pathname;
    this.port     = location.port;
    this.hash     = location.hash;
    if(this.domain.indexOf(':') !== -1) {
      this.domain = this.domain.split(':')[0];
    }
  }

  /*
  ** Called by the constructor when the specified argument is a string.
  */
  initializeFromString(url) {
    let regex = /(file|http[s]?:\/\/)?([^\/?#]*)?([^?#]*)([^#]*)([\s\S]*)/i;
    let matches = url.match(regex)
    if(matches) {
      this.protocol = (matches[1] || '').replace('://', '')
      this.domain = matches[2] || ''
      this.path = matches[3]
      this.query = matches[4]
      this.hash = matches[5]
      this.port = ''
      if(this.domain.indexOf(':') !== -1) {
        let parts = this.domain.split(':')
        this.domain = parts[0]
        this.port = parts[1]
      }
    } else {
      console.error('invalid url: ' + url)
    }
  }

  /*
  ** Returns this url as a string. This method fills the void with the current
  ** page location data if the user doesn't specify one. This prevents
  ** duplicating the same key for caches.
  */
  toString() {
    let urlStr = ''
    urlStr += this.protocol ? this.protocol + '://' : document.location.protocol + '//'
    urlStr += this.domain ? this.domain : document.location.host
    urlStr += this.port ? ':' + this.port : ''
    return urlStr + (this.path || '/') + this.query + this.hash
  }

  /*
  ** Instantiates a new url with the same properties as this but without the
  ** hash part. This is useful for storing reference to cache because the
  ** hash doesn't change the url id.
  */
  withoutHash() {
    let hashless = new Url(this)
    hashless.hash = ''
    return hashless
  }

  /*
  ** Returns a hash map that maps from key -> value for each query parameter
  ** in the Url. For example: '?name=foo&age=10' would result in the map:
  ** { 'name': 'foo', 'age': '10' }. All values are treated as strings.
  */
  queryObject() {
    return encoding.encodeQueryStringToNestedJson(this.query)
  }

  /*
  ** Overrides the query part of the url with the specified object. The object
  ** must be 'encodable' to queryString, so pretty much a JSON without
  ** circular reference. `this` is returned.
  */
  setQueryObject(params) {
    this.query = '?' + encoding.encodeJsonToQueryString(params);
    return this
  }

  /*
  ** Returns associated named params (truthy) if this url matches the given 
  ** url, false otherwise. Urls are matched considering only the path, with
  ** possible params specified with the ':' character. For example,
  ** '/users/:id' will match '/users/10' returning the object { id: '10'}.
  */
  match(url) {
    let pathRegex = this.path
    let matches = pathRegex.match(/:[^\/]+/g)
    if(!matches) return this.path == url.path
    matches.forEach(match => {
      pathRegex = pathRegex.replace(match, "([^\/]+)")
    })
    pathRegex = '^' + pathRegex.replace('/', '\/') + '$'
    let pathMatch = url.path.match(new RegExp(pathRegex))
    if(pathMatch) {
      let namedParams = {}
      matches.forEach((match, index) => {
        match = match.replace(':', '')
        namedParams[match] = pathMatch[index+1]
      })
      return namedParams
    }
    return false
  }
}

module.exports = Url
