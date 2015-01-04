var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var consolidate = require('consolidate');
var compression = require('compression');
var path = require('path');
var update_json = require('./update-json.js');
var spawn = require('child_process').spawn;
var scraper_path = path.join(__dirname, 'scraper', 'scraper.js');
var productionEnv = process.env;
productionEnv.NODE_ENV = 'production';

var server = module.exports.server = exports.server = express();

server.use(logger('dev'));
server.use(bodyParser.json());
server.use(express.static(path.join(__dirname, 'public')));
server.use(compression({ threshold: 200 }));

server.set('port', process.env.PORT || 3000);

var json;

var update = function (callback) {
  update_json(function (err, data) {
    if (err) {
      // in caso di errore mantengo i vecchi cinema
      setImmediate(callback, err);
      return;
    }

    json = data;
    setImmediate(callback, err, data);
  });
};


server.get('/data', function (req, res) {
  res.send(json);
});

server.post('/update', function (req, res) {
  update(function () {
    res.end();
  });
});

server.post('/scrape', function (req, res) {
  var scraper = spawn('node', ['scraper/scraper.js'], {env: productionEnv});
  scraper.on('close', function (code) {
    if (code !== 0) {
      console.error('grep process exited with code ' + code);
      return;
    }

    update(function (err) {
      if (err) {
        //handle error
        return;
      }

    });
  });
  
  res.end();
});

update(function (err) {
  if (err) {
    console.error('Error occurred fetching data from DB...');
    process.exit(-1);
  }

  server.listen(server.get('port'), function() {
    console.log('Express server listening on port # ' + server.get('port'));
  });
});


