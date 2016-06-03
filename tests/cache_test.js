import {Cache} from '../src/cache'

describe('Cache specs', () => {
  let cache
  beforeEach(() => {
    cache = new Cache()
  })

  it('tracks values with set', () => {
    expect(cache.set('name', 'Luiz')).to.be.ok
    expect(cache.set('colors', ['red', 'blue'])).to.be.ok
    expect(cache.set('colors', {'msg': 'Hello'})).to.be.ok
  })

  it('retreives values with get', () => {
    cache.set('name', 'Luiz')
    // TODO: Create a separated test for `has` ?
    expect(cache.has('name')).to.be.true
    expect(cache.get('name')).to.eq('Luiz')
    expect(cache.has('something')).to.be.false
    expect(cache.get('something')).to.be.undefined
  })

  it('expires a cache', () => {
    cache.set('name', 'Luiz')
    cache.expire('name')
    expect(cache.get('name')).to.be.undefined

    cache.expire('something') // does nothing
  })

  it('expires a value with timeout', (done) => {
    cache.set('name', 'Luiz', {
      timeout: 10
    })
    expect(cache.get('name')).to.eq('Luiz')
    setTimeout(() => {
      expect(cache.get('name')).to.be.undefined
      done()
    }, 12)
  })

  it('doesnt expire a value if we update the key', (done) => {
    cache.set('name', 'Luiz', { timeout: 10 })
    expect(cache.get('name')).to.eq('Luiz')
    cache.set('name', 'Paulo')
    setTimeout(() => {
      expect(cache.get('name')).to.eq('Paulo')
      done()
    }, 12)
  })

  it('stores the timestamp of creation', () => {
    let record = cache.set('name', 'Luiz')
    expect(record.createdAt).to.be.ok
  })

  it('finds all caches in a namespace', () => {
    cache.set('user.name', 'Luiz')
    cache.set('user.email', 'luizpvasc@gmail.com')
    let values = cache.getAll('user')
    expect(values).to.eql({'name': 'Luiz', 'email': 'luizpvasc@gmail.com'})
  })

  it('stores the properties of an object when calling it with the first argument', () => {
    cache.set({'browser': 'Firefox', 'name': 'Luiz'})
    expect(cache.get('browser')).to.eq('Firefox')
    expect(cache.get('name')).to.eq('Luiz')
  })

  it('clears all caches with `clearAll`', () => {
    cache.set('name', 'Luiz')
    cache.set('age', 10)
    cache.clearAll()
    expect(cache.has('name')).to.be.false
    expect(cache.has('age')).to.be.false
  })

  it('triggers `set` when data is stored', () => {
    let onSet = sinon.spy((key, value) => {
      expect(key).to.eq('name')
      expect(value).to.eq('luiz')
    })
    cache.on('set', onSet)
    cache.set('name', 'luiz')
    expect(onSet.called).to.be.true
  })

  it('triggers `remove` when data is deleted', () => {
    let onRemove = sinon.spy((key, value) => {
      expect(key).to.eq('name')
      expect(value).to.eq('luiz')
    })
    cache.on('remove', onRemove)
    cache.set('name', 'luiz')
    cache.remove('name')
    expect(onRemove.called).to.be.true
  })

  it('doesnt trigger remove if data wasnt found')
  it('triggers `clear-all` when all data is deleted')
})
