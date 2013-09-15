var http = require('http'),
  cheerio = require('cheerio'),
  webdriverInterface = require('./lib/webdriver-interface.js');

var target = process.env.TARGET;

if (!target) {
  console.error("No target set. `heroku config:add TARGET=http://t.com`");
}

var fakeBrowser = webdriverInterface('localhost', 8990, target);

var app = http.createServer(function (req, resp) {
  console.log("Loading: " + req.url);
  var startedAt = new Date();
  fakeBrowser.loadPage(req.url).then(function (html) {
    var parsed = cheerio.load(html);
    parsed('noscript').remove();
    resp.writeHead(200, {'Content-Type': 'text/html'});
    resp.end(parsed.html());
    console.log((new Date() - startedAt) / 1000 + " seconds");
  });
});

var port = process.env.PORT || 8998;
app.listen(port, function () {
  console.log("Listening on " + port);
});
