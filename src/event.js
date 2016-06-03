/*
** The `Event` class implements a very small subset of browser's native
** CustomEvent.
*/
export default class Event {
  constructor(name, data) {
    this.name = name
    this.timestamp = new Date()
    this.data = data || {}
    this.defaultPrevented = false
  }

  preventDefault() {
    this.defaultPrevented = true
  }
}

