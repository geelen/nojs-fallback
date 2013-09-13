var webdriverInterface = require('./lib/webdriver-interface.js'),
  cheerio = require('cheerio');

var target = process.env.TARGET;

if (!target) {
  console.error("No target set. `heroku config:add TARGET=http://t.com`");
}

var webdriver = webdriverInterface('localhost', 8990, target);

var app = http.createServer(function (req, resp) {
  webdriver.loadPage(req.url).then(function (html) {
    var parsed = cheerio.load(source);
    parsed('noscript').remove();
    resp.writeHead(200, {'Content-Type': 'text/html'});
    resp.end(parsed.html());
  });
});

var port = process.env.PORT || 8998;
app.listen(port, function () {
  console.log("Listening on " + port);
});
