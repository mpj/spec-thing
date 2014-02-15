module.exports = function(bus) {
  var me = {}

  var asDelivery = function(arguments) {
    //if (arguments.length === 1 && isArray(arguments[0]))
      //return arguments[0]
    //if (arguments.length !== 2)
      //throw new Error('Too many arguments')

  }

  me.when = function(whenAddress, whenMessage) {
    return {
      told: function(expectedAddress, expectedMessage) {
        var isOk = false
        bus.on(expectedAddress).then(function(out, deliveries) {
          var message = deliveries[expectedAddress]
          if (message === expectedMessage) {
            isOk = true
            out('expectation-ok', {
              when: [whenAddress, whenMessage],
              told: [expectedAddress, expectedMessage]
            })
          }
        })
        bus.inject(whenAddress, whenMessage)
        return {
          check: function() {
            if(!isOk) {
              bus.inject('expectation-failure', {
                when: [whenAddress, whenMessage],
                told: [expectedAddress, expectedMessage]
              })
            }
          }
        }
      }
    }
  }

  return me
}