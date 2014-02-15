var createBus = require('bus-thing')
var createSpec = require('./spec')
var chai  = require('chai')
expect = chai.expect
chai.should()

describe('when we have a spec and bus', function() {
  var spec, bus;
  beforeEach(function() {
    bus = createBus()
    spec = createSpec(bus)
  })


  it('basic case', function() {
    bus.on('greeting').then(function(O,D) {
      O('render', '<p>' + D['greeting'] + '</p>')
    })

    spec
      .when('greeting', 'hello!!')
      .told('render', '<p>hello!!</p>')
      .check()


    bus.log[2].should.deep.equal({
      unhandled: [ 'expectation-ok', {
        when: [ 'greeting', 'hello!!' ],
        told: [ 'render', '<p>hello!!</p>']
      }]
    })
  })

  it('basic case (failure)', function() {
    bus.on('greeting').then(function(O,D) {
      O('render', '<p>' + D['greeting'] + '</p>')
    })

    spec
      .when('greeting', 'hello!!')
      .told('render', '<div>hello!!</div>') // <- spec wants divs!
      .check()

    bus.log[2].should.deep.equal({
      unhandled: [ 'expectation-failure', {
        when: [ 'greeting', 'hello!!' ],
        told: [ 'render', '<div>hello!!</div>']
      }]
    })
  })

  //console.log("log\n", JSON.stringify(bus.log, null, 2))


})