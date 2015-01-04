'use strict';

var DEBUG = process.env.NODE_ENV !== 'prdoduction';

var jquery_file = './assets/jquery.min.js';
var city_url = 'http://trovacinema.repubblica.it/programmazione-cinema/citta/{{dashed_name}}/{{sign}}/film';
var province_url = 'http://trovacinema.repubblica.it/programmazione-cinema/provincia/{{name}}/{{sign}}/film';

var minstache = require('minstache');
var template_url_citta = minstache.compile(city_url);
var template_url_provincia = minstache.compile(province_url);

var async = require('async');
var jsdom = require('jsdom');

var close_scraper = function (city, city_or_province, done_scraping) {
  return function (errors, window) {
    if (errors) {
      console.log('ERROR occurred scraping ' + city.name + ' ' + city_or_province + '.');
      done_scraping(errors);
      return;
    }

    var films = city['films_in_' + city_or_province] = [];
    var $ = window.$;
    $('.searchRes-group').each(function (i, resGroup) {
      var $resGroup = $(resGroup);
      var title = $resGroup.find('.filmName').text();
      var film = {
        title: title,
        cinemas: []
      };
      films.push(film);
      // loop over cinemas
      $resGroup.find('.resultLineFilm').each(function (j, resultLine) {
        var $resultLine = $(resultLine);
        var cinema = $resultLine.find('.cineName').text();
        var schedule = $resultLine.find('.res-hours').text().split(' ');
        film.cinemas.push({
          name: cinema,
          time: schedule
        });
      });
    });
    DEBUG && console.log('DONE scraping html for ' + city.name + ' ' + city_or_province + '.');
    done_scraping(null, city);
  };
}

var compile_task = function (url, city, city_or_province) {
  return function (done_task) {
    jsdom.env({
      url: url,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: close_scraper(city, city_or_province, done_task)
    });
  };
};

/**
 * module exports
 */

var scrape_city = module.exports = function (city, callback) {
  var url_provincia = template_url_provincia(city);
  var url_citta = template_url_citta(city);
  var is_city = true;

  DEBUG && console.log('scraping html for ' + city.name + '...');

  async.parallel([
    compile_task(url_citta, city, 'city'),
    compile_task(url_provincia, city, 'province')
  ], function (err) {
    if (err) {
      setImmediate(callback, err);
      return;
    }

    setImmediate(callback, null, city);
  });
};
