var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var consolidate = require('consolidate');
var compression = require('compression');

var datapath = path.resolve(__dirname, './public/data.json');

var server = module.exports.server = exports.server = express();

server.use(logger('dev'));
server.use(bodyParser.json());
server.use(express.static(path.join(__dirname, 'public')));
server.use(compression({ threshold: 200 }));

server.set('port', process.env.PORT || 3000);

server.get('/data', function (req, res) {
  res.sendFile(datapath);
});

server.get('/query', function (req, res) {
  var search = req.param('search');
  var pattern = '*' + search.replace(/ /g, '*') + '*';
  
  // to be used instead of client.keys
  // client.scan({pattern: pattern}).pipe(res);
  

  if (search.length < 4) {
    res.send({
      keys: [],
      values: []
    });
    return;
  }
  
  client.keys(pattern, function (err, keys_replies) {
    // handler err
    client.mget(keys_replies, function (err, mget_replies) {
      res.send({
        keys: keys_replies,
        values: mget_replies
      });
    });
  });
});

server.listen(server.get('port'), function() {
  console.log('Express server listening on port # ' + server.get('port'));
});
