var createBus = require('bus-thing')
var createSpec = require('./spec')
var chai  = require('chai')
expect = chai.expect
chai.should()

// TODO multiple givens
// TODO multiple expects
// TODO Stubs (jsut expects that also send)
// TODO Reusable givens (might need clonable bus)
// TODO log.lastMessageOnAddress
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
      .check()


    bus.log[2].should.deep.equal({
      unhandled: [ 'expectation-ok', {
        given: [[ 'greeting', 'hello!!' ]],
        expect: [ 'render', '<p>hello!!</p>']
      }]
    })
  })

  it('basic case (failure)', function() {
    bus.on('greeting').then(function(x) {
      this.send('render', '<p>' + x + '</p>')
    })

    spec
      .given('greeting', 'hello!!')
      .expect('render', '<div>hello!!</div>') // <- spec wants divs!
      .check()

    bus.log[3].should.deep.equal({
      unhandled: [ 'expectation-failure', {
        given: [[ 'greeting', 'hello!!' ]],
        expect: [ 'render', '<div>hello!!</div>']
      }]
    })
  })

  xit('multiple givens', function() {
    spec
      .given('a', true)
      .given('b', true)
      .expect('ok', true)

    bus
      .on('a')
      .on('b')
      .then(function(a, b) {
        if (a && b)
          this.send('ok', true)
      })

    bus.log[0].should.deep.equal(
      [ 'ok', true ])
  })

  //console.log("log\n", JSON.stringify(bus.log, null, 2))


})