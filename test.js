var createBus = require('bus-thing')
var createSpec = require('./spec')
var chai  = require('chai')
expect = chai.expect
chai.should()

// TODO Stubs (jsut expects that also send)
// TODO Reusable givens (might need clonable bus)
// TODO implicit true message in stubs (or perhaps just go for JSON interface?)
// IDEA Perhaps JSON interface instead? Code as data?

describe('given we have a spec and bus', function() {
  var spec, bus;
  beforeEach(function() {
    bus = createBus()
    spec = createSpec(bus)
  })

  it('basic case', function() {
    bus.on('greeting').then(function(x) {
      this.send('render', '<p>' + x + '</p>')
    })

    spec
      .given('greeting', 'hello!!')
      .expect('render', '<p>hello!!</p>')
      .go()
      .check()


    bus.log.wasSent('expectation-ok', [ 'render', '<p>hello!!</p>'] )
  })

  it('basic case (failure)', function() {
    bus.on('greeting').then(function(x) {
      this.send('render', '<p>' + x + '</p>')
    })

    spec
      .given('greeting', 'hello!!')
      .expect('render', '<div>hello!!</div>') // <- spec wants divs!
      .go()
      .check()

    bus.log.wasSent('expectation-failure', [ 'render', '<div>hello!!</div>'])
  })

  it('multiple givens', function() {
    bus
      .on('a')
      .on('b')
      .then(function(a, b) {
        if (a && b)
          this.send('ok', true)
      })

    spec
      .given('a', true)
      .given('b', true)
      .expect('ok', true)
      .go()


    bus.log.wasSent('expectation-ok', [ 'ok', true ] ).should.be.true
  })

  it('multiple expect', function() {
    bus
      .on('a')
      .then(function() {
        this.send('b')
        this.send('c')
      })

    spec
      .given('a')
      .expect('b', true)
      .expect('c', true)
      .go()

    bus.log.wasSent('expectation-ok', [ 'b', true ] ).should.be.true
    bus.log.wasSent('expectation-ok', [ 'c', true ] ).should.be.true
  })

  it('expects that simulate messages', function() {
    bus
      .on('a')
      .then(function() {
        this.send('b')
      })
      .on('c').then(function() {
        this.send('d')
      })

    spec
      .given('a')
      .expectAndSimulate(['b', true], ['c', true])
      .expect('d')
      .go()

    bus.log
      .wasSent('expectation-ok', [ 'd', true ])
      .should.be.true
  })

  it('implicit message', function() {
    bus.on('a').then(function() { this.send('b') })

    spec.given('a').expect('b').go()
    bus.log.wasSent('expectation-ok', [ 'b', true ] ).should.be.true
  })

  it('implicit message (null should not be translated to true)', function() {
    bus.on('a').then(function() { this.send('b', null) })

    spec.given('a').expect('b', null).go()
    bus.log.wasSent('expectation-ok', [ 'b', null ] ).should.be.true
  })

})