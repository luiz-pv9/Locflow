import * as utils from './utils'

const permanentWithNoIDError = new Error('permanent element must have an id')

export class Renderer {
  body() {
    return document.body
  }

  cloneBody() {
    return document.body.cloneNode(true)
  }

  permanentElements() {
    let elements = document.querySelectorAll('*[data-permanent]:not([data-shallow])')
    for(let i = 0; i < elements.length; i++) {
      if( ! elements[i].id) throw new Error("Element with data-permanent must have an ID")
    }
    return elements
  }

  removePermanentElements() {
    let elements = this.permanentElements()
    for(let i = 0; i < elements.length; i++) {
      let element = elements[i]
      let shallowCopy = element.cloneNode(false)
      shallowCopy.setAttribute('data-shallow', '1')
      element.parentNode.replaceChild(shallowCopy, element)
    }
    return elements
  }

  mergePermanentElements(elements) {
    for(let i = 0; i < elements.length; i++) {
      this.replacePermanent(elements[i])
    }
  }

  replacePermanent(element) {
    if( ! element.id) throw permanentWithNoIDError;
    let target = document.getElementById(element.id)
    return target.parentNode.replaceChild(element, target)
  }
}