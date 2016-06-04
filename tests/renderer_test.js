import {Renderer} from '../src/renderer'
import * as utils from '../src/utils'

describe('Renderer specs', () => {
  let renderer
  beforeEach(() => {
    renderer = new Renderer()
  })

  describe('body', () => {
    it('returns a reference to the current body', () => {
      expect(renderer.body()).to.be.ok
      expect(renderer.body()).to.eq(document.body)
    })

    it('clones the current body for caching', () => {
      expect(renderer.cloneBody()).to.be.ok
      expect(renderer.cloneBody()).not.to.eq(document.body)
    })
  })

  describe('permanent elements', () => {
    afterEach(() => {
      let insertedDivs = document.querySelectorAll('div')
      for(let i = 0; i < insertedDivs.length; i++) {
        utils.removeElement(insertedDivs[i])
      }
    })

    it('finds the elements that are permanent on the current page', () => {
      expect(renderer.permanentElements()).to.have.length(0)
      let div = document.createElement('div')
      div.setAttribute('data-permanent', '1')
      div.id = 'my-component'
      document.body.appendChild(div)
      expect(renderer.permanentElements()).to.have.length(1)
      expect(renderer.permanentElements()[0]).to.eql(div)
    })

    it('leaves a shallow copy of of the permanent element when removing', () => {
      let div = document.createElement('div')
      div.setAttribute('data-permanent', '1')
      div.id = 'my-component'
      document.body.appendChild(div)

      let permanent = renderer.removePermanentElements()
      let shallowCopies = document.querySelectorAll('*[data-permanent][data-shallow]')

      expect(shallowCopies).to.have.length(1)
      expect(shallowCopies[0]).not.to.eq(div)
    })

    it('doesnt identify shallow element as permanents', () => {
      let div = document.createElement('div')
      div.setAttribute('data-permanent', '1')
      div.id = 'my-component'
      document.body.appendChild(div)

      expect(renderer.removePermanentElements()).to.have.length(1) // removes existing ones
      expect(renderer.permanentElements()).to.have.length(0) // shallow copies doesn't count
    })

    it('throws an error if the permanent element doesnt have an id', () => {
      let div = document.createElement('div')
      div.setAttribute('data-permanent', '1')
      document.body.appendChild(div)

      let removePermanent = () => { renderer.removePermanentElements() }
      expect(removePermanent).to.throw(/must have an ID/)

      utils.removeElement(div)
    })

    it('removes data-shallow when merging elements', () => {
      let div = document.createElement('div')
      div.setAttribute('data-permanent', '1')
      div.id = 'my-component'
      document.body.appendChild(div)

      let permanent = renderer.removePermanentElements() // removing permanent
      renderer.mergePermanentElements(permanent) // merging back

      expect(renderer.permanentElements()).to.have.length(1)
      expect(renderer.permanentElements()[0]).to.eq(div)
      expect(div.hasAttribute('data-shallow')).to.be.false
    })
  })
})