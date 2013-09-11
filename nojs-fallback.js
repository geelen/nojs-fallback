var wd = require('wd'),
  cheerio = require('cheerio'),
  http = require('http');

var driver = wd.promiseRemote('localhost', 8990),
  target = process.env.TARGET;

if (!target) {
  console.error("No target set. `heroku config:add TARGET=http://t.com`");
}

var loop = function (promise, fn, check) {
  return promise.then(fn).then(function (result) {
    return check(result) ? result : loop(promise, fn, check);
  })
};

var loadPage = function (url) {
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
      console.log("go");
      return driver.source();
    })
    .then(function (source) {
      var parsed = cheerio.load(source);
      parsed('noscript').remove();
      return parsed.html();
    });
};

var app = http.createServer(function (req, resp) {
  loadPage(req.url)
    .then(function(html) {
      resp.writeHead(200, {'Content-Type': 'text/html'});
      resp.end(html)
    });
});

var port = process.env.PORT || 8998;
app.listen(port, function () {
  console.log("Listening on " + port);
});
