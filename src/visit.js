import Url from './url'

export class Visit {
  constructor(locflow, url, opts = {}) {
    this.locflow = locflow
    this.url = new Url(url)
    this.action = opts.action || Visit.ADVANCE
    this.state = 'initialized'
    this.timing = {}
  }

  start() {
    this.state = 'started'
    this._recordTiming('start')
  }

  complete() {
    this.state = 'completed'
    this._recordTiming('complete')
  }

  fail() {
    this.state = 'failed'
  }

  duration() {
    return this.timing['complete'] - this.timing['start']
  }

  changeHistory() {
    if(this.action === Visit.ADVANCE) {
      return window.history.pushState({locflow: true}, null, this.url.path)
    }

    if(this.action === Visit.REPLACE) {
      return window.history.replaceState({locflow: true}, null, this.url.path)
    }
  }

  _recordTiming(step) {
    this.timing[step] = new Date().getTime()
  }
}

Visit.ADVANCE = 'advance'
Visit.REPLACE = 'replace'
Visit.RESTORE = 'restore'