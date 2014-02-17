var createBus = require('bus-thing')
var createSpec = require('./spec')
var chai  = require('chai')
expect = chai.expect
chai.should()

// TODO multiple expects
// TODO Stubs (jsut expects that also send)
// TODO Reusable givens (might need clonable bus)
//
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

})