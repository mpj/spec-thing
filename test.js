var createBus = require('bus-thing')
var checkModule = require('./').checkModule
var spec = require('./').spec
var chai  = require('chai')
expect = chai.expect
chai.should()

// TODO Implicit messages for expectation-failure
// TODO: Don't run wild workers, and visualize when that happens
// TODO: Error on more than one argument to given (passing list instead of args)
//       ... or perhaps make this allowed behavior?
// TODO: More visible in log when a worker works but sends nothing

describe('given we have a spec and bus', function() {
  var bus;
  beforeEach(function() { bus = createBus() })

  it('basic case', function() {
    bus.on('greeting').then(function(x) {
      this.send('render', '<p>' + x + '</p>')
    })

    spec()
      .given('greeting', 'hello!!')
      .expect('render', '<p>hello!!</p>')
      .check(bus)

    bus.log
      .worker('given')
      .didSend('greeting', 'hello!!')
      .should.be.true

    bus.log
      .worker('expectationMet')
      .didLog('render', '<p>hello!!</p>')
      .should.be.true

  })

  it('basic case (failure)', function() {
    bus.on('greeting').then(function(x) {
      this.send('render', '<p>' + x + '</p>')
    })

    spec()
      .given('greeting', 'hello!!')
      .expect('render', '<div>hello!!</div>') // <- spec wants divs!
      .check(bus)

    bus.log
      .worker('expectationNotMet')
      .didLog('render', '<div>hello!!</div>')
      .should.be.true

    bus.log
      .worker('expectationMet')
      .didRun()
      .should.be.false

  })

  it('multiple givens', function() {
    bus
      .on('a')
      .on('b')
      .then(function(a, b) {
        if (a && b)
          this.send('ok', true)
      })

    spec()
      .given('a', true)
      .given('b', true)
      .expect('ok', true)
      .check(bus)


    bus.log
      .worker('expectationMet')
      .didLog('ok', true)
      .should.be.true
  })

  it('multiple expect', function() {
    bus
      .on('a')
      .then(function() {
        this.send('b')
        this.send('c')
      })

    spec()
      .given('a')
      .expect('b', true)
      .expect('c', true)
      .check(bus)

    bus.log
      .worker('expectationMet')
      .didLog('b', true)
      .should.be.true

    bus.log
      .worker('expectationMet')
      .didLog('c', true)
      .should.be.true
  })

  describe('expects that simulate messages', function() {
    beforeEach(function() {
      bus
        .on('a')
        .then(function() {
          this.send('b')
        })
        .on('c', true).then(function() {
          this.send('d')
        })
    })

    it('explicit', function() {
      spec()
        .given('a')
        .expectAndSimulate(['b', true], ['c', true])
        .expect('d')
        .check(bus)

      bus.log
        .worker('expectationMet')
        .didLog('d')
        .should.be.true
    })

    it('implicit', function() {
      spec()
        .given('a')
        .expectAndSimulate(['b'], ['c']) // <- look, no 'trues'
        .expect('d')
        .check(bus)

      bus.log
        .worker('expectationMet')
        .didLog('d')
        .should.be.true
    })
  })

  it('implicit message', function() {
    bus.on('a').then(function() { this.send('b') })
    spec().given('a').expect('b').check(bus)
    bus.log
      .worker('expectationMet')
      .didLog('b')
      .should.be.true
  })

  it('implicit message (null should not be translated to true)', function() {
    bus.on('a').then(function() { this.send('b', null) })

    spec().given('a').expect('b', null).check(bus)
    bus.log
      .worker('expectationMet')
      .didLog('b', null)
      .should.be.true
  })

  it('expects w/o message are catch-all, not inclusive', function() {
    bus.on('a').then(function() { this.send('b', 'cat with a hat') })

    spec().given('a').expect('b').check(bus)
    bus.log
      .worker('expectationMet')
      .didLog('b')
      .should.be.true
  })


  it('expects are matching, not comparing', function() {
    bus
      .on('a').then('b', {
        propertyB: 'John',
        propertyC: 'Wayne'
      })

    spec().given('a').expect('b', {
      propertyC: 'Wayne'
    }).check(bus)


    bus.log
      .worker('expectationMet')
      .didLog('b')
      .should.be.true
  })

  it('chainable givens', function() {
    var givenAB = spec().given('a').given('b')
    var givenCD = spec().given('c').given('d')

    bus.when('a').when('b').when('c').when('d').when('e').then(function() {
      this.send('f')
    })
    spec()
      .extend(givenAB)
      .extend(givenCD)
      .given('e')
      .expect('f')
      .check(bus)

      bus.log.wasSent('f').should.be.true

  })

  it('description', function() {
    var givenA = spec()
      .describe('Given the a,')
      .given('a')

    spec()
      .extend(givenA)
      .describe('expect some of that b')
      .expect('b')
      .check(bus)

    bus.log.lastSent('spec-description').should.equal(
      'Given the a, expect some of that b')
  })

  it('multiple specs', function(done) {

    var resultPromise = checkModule({
      installer: function(bus) {
        bus.on('add').then(function(operands) {
          if (operands[0] === 3) operands[0] = 666; // <- I'm a bug!!!
          this.send('add-result', operands[0] + operands[1])
        })
      },
      specs: [
        spec()
          .describe('Adds 1 + 2')
          .given('add', [1,2])
          .expect('add-result', 3),

        spec()
          .describe('Adds 3 + 4')
          .given('add', [3,4])
          .expect('add-result', 7),

        spec()
          .describe('Multiplies 9 * 2')
          .given('multiply', [ 9, 2 ])
      ]
    })

    resultPromise.then(function(result) {
      result.should.deep.equal({
        results: [
          {
            description: 'Adds 1 + 2',
            status: 'met'
          },
          {
            description: 'Adds 3 + 4',
            status: 'notmet'
          },
          {
            description: 'Multiplies 9 * 2',
            status: 'pending'
          }
        ]
      })
    }).done(done)

  })

  it ('inspecting single spec', function(done) {
    var passiveSpecWorkerExecuted = false
    var resultPromise = checkModule({
      installer: function(bus) {
        bus.on('a').then(function() {
          passiveSpecWorkerExecuted = true
          this.send('b')
        })
        bus.on('c').then(function() {
          // Do nothing
        })
      },
      specs: [
        spec()
          .describe('Given a, b should be sent')
          .given('a')
          .expect('b'),

        spec()
          .inspect()
          .describe('Given c, d should be sent')
          .given('c')
          .expect('d')

      ]
    })

    resultPromise.then(function(bus) {
      passiveSpecWorkerExecuted.should.equal.false
      bus.log
        .worker('expectationNotMet')
        .didLog('d')
        .should.be.true
    }).done(done)
  })
})

function dbg(bus) {
  console.log('')
  console.log('--- DEBUG ---')
  console.log(JSON.stringify(bus.log.all(), null, 2))
}