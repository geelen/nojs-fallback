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
      return driver.init()
        .then(function () {
          return driver.get(target + url);
        })
        .then(function () {
          return driver.source();
        });
    }
  };
}

