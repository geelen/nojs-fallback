var wd = require('wd');

var loop = function (promise, fn, check) {
  return promise.then(fn).then(function (result) {
    return check(result) ? result : loop(promise, fn, check);
  })
};

module.exports = function (wdHost, wdPort, target) {
  var driver = wd.promiseRemote(wdHost, wdPort);
  return {
    loadPage: function (url) {
      // Load the page to start with
      var page = driver.init()
        .then(function () {
          return driver.get(target + url);
        });
      // loop takes three arguments:
      //   - a promise we're initially waiting for
      //   - a function that gives us a promise of the next value
      //   - a function to test each value that's returned
      // and returns a promise that will be resolved when the
      // test finally matches
      var finishedLoading = loop(page, function () {
        return driver.getLocalStorageKey('nojsSnapshotGo');
      }, function (val) {
        return val === "true";
      });
      // Snapshot ready, send it back
      return finishedLoading
        .then(function () {
          return driver.source();
        });
    }
  };
};

