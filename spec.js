var partial = require('mout/function/partial')
var isUndefined = require('mout/lang/isUndefined')
var isFunction = require('mout/lang/isFunction')

module.exports = {
  checkModule: require('./check-module'),
  spec: function() {

    var me = {
      instructions: [],
      given: function(givenAddress, givenMessage) {
        me.instructions.push([ 'given', givenAddress, givenMessage ])
        return me
      },
      expectAndSimulate: function(expect, simulate) {
        me.instructions.push(
          ['expect', expect[0], expect[1], simulate[0], simulate[1]])
        return me
      },
      expect: function(expectedAddress, expectedMessage) {
        me.instructions.push( [ 'expect', expectedAddress, expectedMessage ])
        return me
      },
      inspect: function() {
        me.inspectMe = true
        return me
      },
      describe: function(part) {
        me.instructions.push(function(bus) {
          bus
            .on('spec-start')
            .peek('spec-description')
            .then(function(_, description) {
              this.send('spec-description',
                !!description ? description + ' ' + part : part)
            })
        })
        return me
      },
      check: function(bus) {
        me.instructions.forEach(function(ins) {
          if (isFunction(ins)) {
            ins(bus)
            return
          }
          if (ins[0] === 'given') {
            bus.on('spec-start').then(function given() {
              this.send(ins[1], ins[2])
            })
          }
          if (ins[0] === 'expect') {
            var expectedAddress = ins[1]
            var expectedMessage = ins[2]
            var simulateAddress = ins[3]
            var simulateMessage = ins[4]

            var isOk = false
            bus.on(expectedAddress, expectedMessage).then(function expectationMet(actualMessage) {
              isOk = true
              if (simulateAddress) {
                this.send(simulateAddress,
                  isUndefined(simulateMessage) ? true : simulateMessage )
              }
              this.log(expectedAddress, expectedMessage)
            })

            bus.on('spec-check').then(function expectationNotMet() {
              if(!isOk)
                this.log(expectedAddress, expectedMessage)
            })
          }

        })
        bus.inject('spec-start')
        bus.inject('spec-check')
        bus.inject('spec-done')
      },
      extend: function(parent) {
        me.instructions =
          me.instructions.concat(parent.instructions)
        return me
      }
    }

    return me
  }
}