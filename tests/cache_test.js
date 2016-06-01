import {Cache} from '../src/cache'

describe('Cache specs', () => {
  it('tracks values with set', () => {
    expect(Cache.set('name', 'Luiz')).to.be.ok
    expect(Cache.set('colors', ['red', 'blue'])).to.be.ok
    expect(Cache.set('colors', {'msg': 'Hello'})).to.be.ok
  })

  it('retreives values with get', () => {
    Cache.set('name', 'Luiz')
    // TODO: Create a separated test for `has` ?
    expect(Cache.has('name')).to.be.true
    expect(Cache.get('name')).to.eq('Luiz')
    expect(Cache.has('something')).to.be.false
    expect(Cache.get('something')).to.be.undefined
  })

  it('expires a cache', () => {
    Cache.set('name', 'Luiz')
    Cache.expire('name')
    expect(Cache.get('name')).to.be.undefined

    Cache.expire('something') // does nothing
  })

  it('expires a value with timeout', (done) => {
    Cache.set('name', 'Luiz', {
      timeout: 10
    })
    expect(Cache.get('name')).to.eq('Luiz')
    setTimeout(() => {
      expect(Cache.get('name')).to.be.undefined
      done()
    }, 12)
  })

  it('doesnt expire a value if we update the key', (done) => {
    Cache.set('name', 'Luiz', { timeout: 10 })
    expect(Cache.get('name')).to.eq('Luiz')
    Cache.set('name', 'Paulo')
    setTimeout(() => {
      expect(Cache.get('name')).to.eq('Paulo')
      done()
    }, 12)
  })

  it('stores the timestamp of creation', () => {
    let record = Cache.set('name', 'Luiz')
    expect(record.createdAt).to.be.ok
  })

  it('finds all caches in a namespace', () => {
    Cache.set('user.name', 'Luiz')
    Cache.set('user.email', 'luizpvasc@gmail.com')
    let values = Cache.getAll('user')
    expect(values).to.eql({'name': 'Luiz', 'email': 'luizpvasc@gmail.com'})
  })

  it('stores the properties of an object when calling it with the first argument', () => {
    Cache.set({'browser': 'Firefox', 'name': 'Luiz'})
    expect(Cache.get('browser')).to.eq('Firefox')
    expect(Cache.get('name')).to.eq('Luiz')
  })

  it('clears all caches with `clearAll`', () => {
    Cache.set('name', 'Luiz')
    Cache.set('age', 10)
    Cache.clearAll()
    expect(Cache.has('name')).to.be.false
    expect(Cache.has('age')).to.be.false
  })

  it('triggers `set` when data is stored', () => {
    let onSet = sinon.spy((key, value) => {
      expect(key).to.eq('name')
      expect(value).to.eq('luiz')
    })
    Cache.on('set', onSet)
    Cache.set('name', 'luiz')
    expect(onSet.called).to.be.true
  })

  it('triggers `remove` when data is deleted', () => {
    let onRemove = sinon.spy((key, value) => {
      expect(key).to.eq('name')
      expect(value).to.eq('luiz')
    })
    Cache.on('remove', onRemove)
    Cache.set('name', 'luiz')
    Cache.remove('name')
    expect(onRemove.called).to.be.true
  })

  it('doesnt trigger remove if data wasnt found')
  it('triggers `clear-all` when all data is deleted')
})
