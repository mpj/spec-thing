var partial = require('mout/function/partial')

module.exports = function(bus) {

  var asDelivery = function(arguments) {
    //if (arguments.length === 1 && isArray(arguments[0]))
      //return arguments[0]
    //if (arguments.length !== 2)
      //throw new Error('Too many arguments')
  }

  function createCommand(givens) {
    givens = givens.slice(0)
    return {
      given: function(givenAddress, givenMessage) {
        var newGivens = givens.concat( [[ givenAddress, givenMessage ]] )

        return {
          expect: function(expectedAddress, expectedMessage) {
            var isOk = false
            var expectationLog = {
              given: [givenAddress, givenMessage],
              expect: [expectedAddress, expectedMessage]
            }
            bus.on(expectedAddress).then(function(actualMessage) {
              if (actualMessage === expectedMessage) {
                isOk = true
                this.send('expectation-ok', expectationLog)
              }
            })
            newGivens.forEach(function(given) {
              bus.inject.apply(bus, given)
            })

            return {
              check: function() {
                if(!isOk) {
                  bus.inject('expectation-failure', expectationLog)
                }
              }
            }
          },
          given: partial(createCommand, givens)
        }
      }
    }
  }

  var me = createCommand([])



  return me
}