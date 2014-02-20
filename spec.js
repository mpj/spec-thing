var partial = require('mout/function/partial')
var isUndefined = require('mout/lang/isUndefined')

module.exports = function() {

  var instructions = []

  function createCommand(instructions) {
    return {
      given: function(givenAddress, givenMessage) {
        instructions.push([ 'given', givenAddress, givenMessage ])
        return createCommand(instructions)
      },
      expectAndSimulate: function(expect, simulate) {
        instructions.push(
          ['expect', expect[0], expect[1], simulate[0], simulate[1]])
        return createCommand(instructions)
      },
      expect: function(expectedAddress, expectedMessage) {
        instructions.push( [ 'expect', expectedAddress, expectedMessage ])
        return createCommand(instructions)
      },
      check: function(bus) {
        var me = this
        instructions.forEach(function(ins) {
          if (ins[0] === 'given') {
            bus.on('spec-run').then(function() {
              this.send(ins[1], ins[2])
            })
          }
          if (ins[0] === 'expect') {
            var expectedAddress = ins[1]
            var expectedMessage = ins[2]
            var simulateAddress = ins[3]
            var simulateMessage = ins[4]

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
          }

        })
        bus.inject('spec-run')
        bus.inject('spec-check')
      }
    }
  }

  var me = createCommand([])



  return me
}