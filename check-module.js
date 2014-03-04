var createBus = require('bus-thing')
var Q = require('q')
var find = require('mout/array/find')

function checkModule(module) {
  var inspectee = find(module.specs, 'inspectMe')
  if(inspectee) {

    var deferred = Q.defer()
    var bus = createBus()
    module.installer(bus)
    bus.on('spec-done').then(function() {
      deferred.resolve(bus)
    })
    inspectee.check(bus)
    return deferred.promise
  }
  var resultPromises = module.specs.map(function(spec) {
    var deferred = Q.defer()
    var bus = createBus()
    module.installer(bus)
    bus
      .on('spec-done')
      .peek('spec-description')
      .then(function(_, description) {
        var metSent = bus.log
          .worker('expectationMet')
          .didLog()
        var notMetSent = bus.log
          .worker('expectationNotMet')
          .didLog()

        var status;
        if(notMetSent)
          status = 'notmet'
        else if(metSent)
          status = 'met'
        else
          status = 'pending'

        deferred.resolve({
          description: description,
          status: status
        })
      })
    spec.check(bus)
    return deferred.promise
  })
  return Q.all(resultPromises).then(function(results) {
    return { results: results}
  })
}

module.exports = checkModule;