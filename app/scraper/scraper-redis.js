'use strict';

var html_file = './data/films.html';
var jquery_file = './assets/jquery.min.js';

var cities = require('./data/cities.js');
var minstache = require('minstache');
var template_url_citta = minstache.compile('http://trovacinema.repubblica.it/programmazione-cinema/citta/{{dashed_name}}/{{sign}}/film');
var template_url_provincia = minstache.compile('http://trovacinema.repubblica.it/programmazione-cinema/provincia/{{name}}/{{sign}}/film');

var async = require('async');
var jsdom = require('jsdom');
var fs = require('fs');
var html = fs.readFileSync(html_file, 'utf-8');
var jquery = fs.readFileSync(jquery_file, 'utf-8');

var redis = require("redis");
var client = redis.createClient();

var fs = require('fs');
var data = [];

client.on("error", function (err) {
  console.log("Error " + err);
});

var redis_key_template = minstache.compile('CITY={{city}};TYPE={{type}};CINEMA={{cinema}};TITLE={{title}}');

var to_redis = function (result, done) {
  // KEY: city=verona;title=interstellar;cinema=odeon;type=provincia
  // VALUE ["18:00", "20:45", "23:00"]

  // KEY: city=roma;title=avatar;cinema=maestoso;type=citta
  // VALUE ["18:00", "20:45", "23:00"]

  // use instead mapLimit(arr, limit, iterator, callback) 
  var commands = [];

  result.forEach(function (city) {
    city.forEach(function (film) {
      film.forEach(function (cinema) {
        if (cinema.time && cinema.time.length) {
          var key = redis_key_template(cinema);
          var value = JSON.stringify(cinema.time); 
          // console.log(key + ' ' + value);
          commands.push(key);
          commands.push(value);
          data.push(cinema);
        }
      });
    });
  });

  if (!commands.length) {
    done();
    return;
  }

  // client.mset(commands, done);
  done();
};

var close_scraper = function (city, is_city, done_scraping) {
  return function (errors, window) {
    if (errors) {
      console.log('errors occurred');
      done_scraping(errors);
      return;
    }
    var films = [];
    var $ = window.$;
    var type = is_city ? 'citta' : 'provincia';
    $('.searchRes-group').each(function (i, resGroup) {
      var film = [];
      films.push(film);
      // console.log(resGroup);
      var $resGroup = $(resGroup);
      var title = $resGroup.find('.filmName').text().toLowerCase();
      // loop over cinemas
      $resGroup.find('.resultLineFilm').each(function (j, resultLine) {
        var $resultLine = $(resultLine);
        film.push({
          city: city,
          type: type,
          title: title,
          cinema: $resultLine.find('.cineName').text().toLowerCase(),
          time: $resultLine.find('.res-hours').text().split(' ')
        });
      });
    });
    done_scraping(null, films);
  };
}

var compile_task = function (url, city_name, is_city) {
  return function (done_task) {
    jsdom.env({
      url: url,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: close_scraper(city_name, is_city, done_task)
    });
  };
};

async.eachLimit(cities, 12, function (city_obj, done) {
  console.log('scraping films and cinemas for ' + city_obj.name + '...');
  var url_provincia = template_url_provincia(city_obj);
  var url_citta = template_url_citta(city_obj);
  var is_city = true;

  // async.series([
  async.parallel([
    compile_task(url_citta, city_obj.name, is_city),
    compile_task(url_provincia, city_obj.name, !is_city)
  ], function (err, result) {
    if (err) {
      done(err);
      return;
    }

    to_redis(result, done);
  });

}, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(data.length + ' items');
  fs.writeFileSync('cinema.txt', JSON.stringify(data), 'utf-8');
  console.log('DONE!');
  process.exit(0);
});
