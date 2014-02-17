var partial = require('mout/function/partial')

module.exports = function(bus) {

  var asDelivery = function(arguments) {
    //if (arguments.length === 1 && isArray(arguments[0]))
      //return arguments[0]
    //if (arguments.length !== 2)
      //throw new Error('Too many arguments')
  }

  function createCommand() {
    return {
      given: function(givenAddress, givenMessage) {
        bus.on('spec-run').then(function() {
          this.send(givenAddress, givenMessage)
        })
        return createCommand()
      },
      expect: function(expectedAddress, expectedMessage) {
        var isOk = false
        bus.on(expectedAddress).then(function(actualMessage) {
          if (actualMessage === expectedMessage) {
            isOk = true
            this.send('expectation-ok',
              [ expectedAddress, expectedMessage ])
          }
        })

        bus.on('spec-check').then(function() {
          if(!isOk)
            this.send('expectation-failure',
              [ expectedAddress, expectedMessage ])
        })
        return createCommand()
      },
      check: function() {
        bus.inject('spec-check')
      },
      go: function() {
        bus.inject('spec-run')
        return createCommand()
      }
    }
  }

  var me = createCommand()



  return me
}