import EventEmitter from 'events'
import * as utils from './utils'

const EVENT_SET = 'set'
const EVENT_REMOVE = 'remove'
const EVENT_REMOVE_ALL = 'remove:all'

export class Cache extends EventEmitter {
  constructor() {
    super()
    this.data = {}
  }

  set(key, value, opts) {
    // If the user specified an object in the first argument, we track each key
    // as if they're tracking each separated value.
    if(utils.isObject(key)) {
      let data = key
      return Object.keys(data).forEach(key => { this.set(key, data[key], opts) })
    }

    let previousRecord = this.getRecord(key)
    if(previousRecord && previousRecord.timeout) {
      clearTimeout(previousRecord.timeout)
    }

    let record = this.data[key] = { value: value, createdAt: new Date().getTime() }
    if(opts && opts.timeout) {
      record.timeout = setTimeout(() => { this.expire(key) }, opts.timeout) }

    this.emit(EVENT_SET, key, value, record)
    return record
  }

  get(key) {
    let record = this.getRecord(key)
    if(record) return record.value
  }

  getRecord(key) {
    return this.data[key]
  }

  getAll(namespace) {
    namespace += '.'
    let keys = Object.keys(this.data)
    let values = {}
    keys.forEach(key => {
      if(key.indexOf(namespace) === 0) {
        let normalKey = key.replace(namespace, '')
        values[normalKey] = this.get(key)
      }
    })
    return values
  }

  has(key) {
    return this.get(key) != null
  }

  remove(key) {
    this.emit(EVENT_REMOVE, key, this.get(key))
    delete this.data[key]
  }
  expire(key) { return this.remove(key) }

  clearAll(key) {
    for(let key in this.data) {
      delete this.data[key]
    }
  }
}
