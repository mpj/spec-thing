var createBus = require('bus-thing')
var Q = require('q')

function checkModule(module) {
  var resultPromises = module.specs.map(function(spec) {
    var deferred = Q.defer()
    var bus = createBus()
    module.installer(bus)
    bus
      .on('spec-expectations-done')
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