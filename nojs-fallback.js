var wd = require('wd'),
  cheerio = require('cheerio');

var driver = wd.promiseRemote('localhost', 8990),
  target = process.env.TARGET;

if (!target) {
  console.error("No target set. `heroku config:add TARGET=http://t.com`");
}

var page = driver
  .init()
  .then(function () {
    return driver.get(target);
  });

var loop = function (promise, fn) {
  return promise.then(fn).then(function (result) {
    return result !== "true" ? loop(promise, fn) : result;
  })
};

loop(page, function () {
  return driver.getLocalStorageKey('scrape-away');
})
  .then(function () {
    return driver.source();
  })
  .then(function (source) {
    var parsed = cheerio.load(source);
    parsed('noscript').remove();
    console.log(parsed.html());
  });
