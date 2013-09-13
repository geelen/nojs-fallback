var wd = require('wd'),
  http = require('http');

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

      // Use a loop here to keep checking if the localStorage
      // value has been set
      var finishedLoading = loop(page, function () {
        return driver.getLocalStorageKey('scrape-away');
      }, function (val) {
        return val === "true";
      });

      // Fetch the source, strip <noscript> tags, and forward on
      return finishedLoading
        .then(function () {
          return driver.source();
        });
    }
  };
}

