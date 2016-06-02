import Event from '../src/event'

describe('Event specs', () => {
  let event
  beforeEach(() => {
    event = new Event("my-event")
  })

  it('stores the given name in the event', () => {
    expect(event.name).to.eq("my-event")
  })

  it('grabs the current time in timestamp', () => {
    expect(event.timestamp).to.be.at.most(new Date())
  })

  it('initializes an empty data', () => {
    expect(event.data).to.eql({})
  })

  it('uses the given object as data', () => {
    event = new Event('my-event', { hello: 'world' })
    expect(event.data).to.eql({ hello: 'world' })
  })

  describe('#preventDefault', () => {
    it('updates internal flag to true', () => {
      expect(event.defaultPrevented).to.be.false
      event.preventDefault()
      expect(event.defaultPrevented).to.be.true
    })
  })
})