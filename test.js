var createBus = require('bus-thing')
var createSpec = require('./spec')
var chai  = require('chai')
expect = chai.expect
chai.should()


// TODO multiple tolds
// TODO Something better than told? Just expect?
// TODO Stubs (jsut expects that also send)

describe('given we have a spec and bus', function() {
  var spec, bus;
  beforeEach(function() {
    bus = createBus()
    spec = createSpec(bus)
  })


  it('basic case', function() {
    bus.on('greeting').then(function(x) {
      this.tell('render', '<p>' + x + '</p>')
    })

    spec
      .given('greeting', 'hello!!')
      .told('render', '<p>hello!!</p>')
      .check()


    bus.log[2].should.deep.equal({
      unhandled: [ 'expectation-ok', {
        given: [ 'greeting', 'hello!!' ],
        told: [ 'render', '<p>hello!!</p>']
      }]
    })
  })

  it('basic case (failure)', function() {
    bus.on('greeting').then(function(x) {
      this.tell('render', '<p>' + x + '</p>')
    })

    spec
      .given('greeting', 'hello!!')
      .told('render', '<div>hello!!</div>') // <- spec wants divs!
      .check()

    bus.log[2].should.deep.equal({
      unhandled: [ 'expectation-failure', {
        given: [ 'greeting', 'hello!!' ],
        told: [ 'render', '<div>hello!!</div>']
      }]
    })
  })

  //console.log("log\n", JSON.stringify(bus.log, null, 2))


})