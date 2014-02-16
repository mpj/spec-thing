var partial = require('mout/function/partial')

module.exports = function(bus) {

  var asDelivery = function(arguments) {
    //if (arguments.length === 1 && isArray(arguments[0]))
      //return arguments[0]
    //if (arguments.length !== 2)
      //throw new Error('Too many arguments')
  }

  function createCommand(givens) {
    return {
      given: function(givenAddress, givenMessage) {
        return createCommand(
          givens.slice(0).concat([[ givenAddress, givenMessage ]]))
      },
      expect: function(expectedAddress, expectedMessage) {
        var isOk = false
        var expectationLog = {
          given: givens,
          expect: [expectedAddress, expectedMessage]
        }
        bus.on(expectedAddress).then(function(actualMessage) {
          if (actualMessage === expectedMessage) {
            isOk = true
            this.send('expectation-ok', expectationLog)
          }
        })
        givens.forEach(function(given) {
          bus.inject.apply(bus, given)
        })
        bus.on('check-expectations').then(function() {
          if(!isOk)
            bus.inject('expectation-failure', expectationLog)
        })
        return createCommand(givens)
      },
      check: function() {
        bus.inject('check-expectations')
      }
    }
  }

  var me = createCommand([])



  return me
}