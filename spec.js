module.exports = function(bus) {
  var me = {}

  var asDelivery = function(arguments) {
    //if (arguments.length === 1 && isArray(arguments[0]))
      //return arguments[0]
    //if (arguments.length !== 2)
      //throw new Error('Too many arguments')
  }

  me.given = function(givenAddress, givenMessage) {
    return {
      told: function(expectedAddress, expectedMessage) {
        var isOk = false
        var expectationLog = {
          given: [givenAddress, givenMessage],
          told: [expectedAddress, expectedMessage]
        }
        bus.on(expectedAddress).then(function(actualMessage) {
          if (actualMessage === expectedMessage) {
            isOk = true
            this.send('expectation-ok', expectationLog)
          }
        })
        bus.inject(givenAddress, givenMessage)
        return {
          check: function() {
            if(!isOk) {
              bus.inject('expectation-failure', expectationLog)
            }
          }
        }
      }
    }
  }

  return me
}