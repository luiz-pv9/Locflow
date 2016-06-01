import Url from '../src/url'
let should = require('chai').should()

describe('url specs', () => {
  it('is a class', () => {
    let dixte = new Url('dixte.com')
    dixte.should.be.an.Object
  })

  describe('constructor - string', () => {
    it('identifies from a string with all data', () => {
      let dixte = new Url('https://dixte.com:8000/my/path?name=foo#bar')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('https')
      dixte.domain.should.eq('dixte.com')
      dixte.port.should.eq('8000')
      dixte.path.should.eq('/my/path')
      dixte.query.should.eq('?name=foo')
      dixte.hash.should.eq('#bar')
    })

    it('identifies from a string without port', () => {
      let dixte = new Url('https://dixte.com/my/path?name=foo#bar')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('https')
      dixte.domain.should.eq('dixte.com')
      dixte.port.should.eq('')
      dixte.path.should.eq('/my/path')
      dixte.query.should.eq('?name=foo')
      dixte.hash.should.eq('#bar')
    })

    it('identifies from a string without port, hash', () => {
      let dixte = new Url('https://dixte.com/my/path?name=foo')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('https')
      dixte.domain.should.eq('dixte.com')
      dixte.port.should.eq('')
      dixte.path.should.eq('/my/path')
      dixte.query.should.eq('?name=foo')
      dixte.hash.should.eq('')
    })

    it('identifies from a string without port, hash, query', () => {
      let dixte = new Url('https://dixte.com/my/path')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('https')
      dixte.domain.should.eq('dixte.com')
      dixte.port.should.eq('')
      dixte.path.should.eq('/my/path')
      dixte.query.should.eq('')
      dixte.hash.should.eq('')
    })

    it('identifies from a string without port, hash, query, path', () => {
      let dixte = new Url('https://dixte.com')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('https')
      dixte.domain.should.eq('dixte.com')
      dixte.port.should.eq('')
      dixte.path.should.eq('')
      dixte.query.should.eq('')
      dixte.hash.should.eq('')
    })

    it('identifies from a string without port, hash, query, path, protocol', () => {
      let dixte = new Url('dixte.com')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('')
      dixte.domain.should.eq('dixte.com')
      dixte.port.should.eq('')
      dixte.path.should.eq('')
      dixte.query.should.eq('')
      dixte.hash.should.eq('')
    })

    it('identifies from a string without port, domain, hash, query, protocol', () => {
      let dixte = new Url('/posts/10')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('')
      dixte.domain.should.eq('')
      dixte.port.should.eq('')
      dixte.path.should.eq('/posts/10')
      dixte.query.should.eq('')
      dixte.hash.should.eq('')
    })

    it('identifies from a string without port, domain, hash, protocol', () => {
      let dixte = new Url('/posts/10?view=column')
      dixte.should.be.an.Object
      dixte.protocol.should.eq('')
      dixte.domain.should.eq('')
      dixte.port.should.eq('')
      dixte.path.should.eq('/posts/10')
      dixte.query.should.eq('?view=column')
      dixte.hash.should.eq('')
    })
  })

  describe('.queryObject', () => {
    it('returns a map from a single query', () => {
      let dixte = new Url('/posts?search=cat')
      dixte.queryObject().should.eql({'search': 'cat'})
    })

    it('returns a map from multiple params', () => {
      let dixte = new Url('/posts?search=cat&type=feline')
      dixte.queryObject().should.eql({
        'search': 'cat',
        'type': 'feline'
      })
    })

    it('returns a map from an array of values', () => {
      let dixte = new Url('/posts?color=red&color=blue&size[]=small&size[]=big')
      dixte.queryObject().should.eql({
        'color': ['red', 'blue'],
        'size': ['small', 'big']
      })
    })

    it('returns a map with nested object values', () => {
      let dixte = new Url('/posts?post[name]=foo&post[title]=bar')
      dixte.queryObject().should.eql({
        'post': {
          'name': 'foo',
          'title': 'bar'
        }
      })
    })
  })

  describe('.setQueryObject', () => {
    it('overrides the previous query with the specified one', () => {
      let url = new Url('reflinks.com?param=one')
      url.setQueryObject({param: 'two'})
      url.query.should.eql("?param=two")
    })

    it('encodes nested properties', () => {
      let url = new Url('reflinks.com')
      url.setQueryObject({post: {author: {name: 'Luiz'}}})
      url.query.should.eql('?post[author][name]=Luiz')
    })
  })

  describe('.toString', () => {
    it('returns the url with with the curren protocol if none is specified', () => {
      let url = new Url('www.reflinks.com/path')
      url.toString().should.eql("http://www.reflinks.com/path")
    })

    it('returns the url with hash content', () => {
      let url = new Url('www.reflinks.com/path#target')
      url.toString().should.eql("http://www.reflinks.com/path#target")
    })

    it('returns the current domain if none is specified', () => {
      let url = new Url('/users/10?foo=bar')
      url.toString().should.eql('http://localhost:9876/users/10?foo=bar')
    })

    it('uses / as the path if none is specified', () => {
      let url = new Url('reflinks.com')
      url.toString().should.eql('http://reflinks.com/')
    })
  })

  describe('.withoutHash', () => {
    it('returns the url without the hash part', () => {
      let url = new Url('www.reflinks.com/path#target')
      url.withoutHash().toString().should.eql("http://www.reflinks.com/path")
    })
  })

  describe('.match', () => {
    it('retunrs true if two urls are the same', () => {
      let url1 = new Url('/users/10')
      let url2 = new Url('/users/10')
      url1.match(url2).should.be.ok
    })

    it('returns true if a path has a matched placeholder', () => {
      let url1 = new Url('/users/:id')
      let url2 = new Url('/users/10')
      url1.match(url2).should.be.ok
      url1.match(url2).should.eql({id: '10'})
    })

    it('returns false if two urls doesnt match', () => {
      let url1 = new Url('/users/:id')
      let url2 = new Url('/users/10/friends')
      url1.match(url2).should.be.false
    })

    it('matches urls with multiple arguments', () => {
      let url1 = new Url('/users/:user_id/comments/:comment_id')
      let url2 = new Url('/users/10/comments/15')
      url1.match(url2).should.be.ok
      let match = url1.match(url2)
      match.should.eql({
        user_id: '10',
        comment_id: '15'
      })
    })
  })
})
