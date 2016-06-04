import Url from './url'
import {Request} from './request'

export class Visit {
  constructor(locflow, url, opts = {}) {
    this.locflow = locflow
    this.url = new Url(url)
    this.action = opts.action || Visit.ADVANCE
    this.state = 'initialized'
    this.timing = {}
    this.propose()
  }

  propose() {
    this.locflow.adapter.visitProposed(this)
  }

  start() {
    this.state = 'started'
    this._recordTiming('start')
    this.locflow.adapter.visitRequestStarted(this)
    this.request = Request.GET(this.url)
  }

  complete() {
    this.state = 'completed'
    this._recordTiming('complete')
  }

  fail() {
    this.state = 'failed'
  }

  abort() {
    this.state = 'aborted'
    if(this.request) this.request.abort()
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