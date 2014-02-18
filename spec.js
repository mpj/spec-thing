var partial = require('mout/function/partial')
var isUndefined = require('mout/lang/isUndefined')

module.exports = function(bus) {

  function createCommand() {
    return {
      given: function(givenAddress, givenMessage) {
        bus.on('spec-run').then(function() {
          this.send(givenAddress, givenMessage)
        })
        return createCommand()
      },
      expectAndSimulate: function(expect, simulate) {
        this.expect(expect[0], expect[1], simulate[0], simulate[1])
        return createCommand()
      },
      expect: function(expectedAddress, expectedMessage, simulateAddress, simulateMessage) {
        var isOk = false
        bus.on(expectedAddress).then(function(actualMessage) {
          if (actualMessage === expectedMessage || isUndefined(expectedMessage)) {
            isOk = true
            if (simulateAddress) {
              this.send(simulateAddress,
                isUndefined(simulateMessage) ? true : simulateMessage )
            }


            this.send('expectation-ok',
              isUndefined(expectedMessage) ?
              [ expectedAddress ] :
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