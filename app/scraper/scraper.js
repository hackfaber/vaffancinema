'use strict';

/**
 * How it works
 *
 * Once every three days it starts the loop:
 * 1) it retrieve the <cities> collection from db and for each city:
 *   a) check if <last_update> is older than three days and in that case:
 *   b) retrieve corresponding html page and scrape it.
 *   c) save result of scraping in <data> collection on db
 *   d) update <last_update> in <city> item
 *
 * 2) if an error occurred during scraping (often correction ends to be resetted) 
 *    it retry 10 times restarting scraping process
 *   a) if preocess fials 10 times, save and error object on db
 *
 * 3) notify city update to server via api call
 */

var DEBUG = process.env.NODE_ENV !== 'production';
var CONCURRENCY = 2;
var mongojs = require('mongojs');
var mongourl = process.env.NODE_TARGET === 'remote' ? 'mongodb://localhost:4321/vaffancinema'
 : 'vaffancinema';
var db = mongojs(mongourl, ['items', 'errors']);
var scrape_city = require('./scrape-city.js');
var async = require('async');
var moment = require('moment');

var now = moment();
var test = DEBUG ? now : now.subtract(3, 'days');

var counter = 0;
var decrement = function (done) {
  return function (err) { 
    if (!err) {
      counter -= 1; 
    };

    if (counter <= 0) {
      setImmediate(done);
    }
  };
};

// scrape_city_callback

var scrape_city_callback = function (city, done) {
  return function (err) {
    if (err) {
      // here is the place to check if a maximum retry has been reached
      console.log(err);
      q.push(city, decrement(done));
      return;
    }

    city.last_update = now.toDate();
    db.items.save(city, done); // saving correclty ended should be checked
  };
};

// process_city

var process_city = function (task, done) {
  var last_update = task.last_update;
  if (last_update !== undefined && test.isBefore(last_update)) {
    setImmediate(done);
    return;
  }

  db.items.findOne({_id: task._id}, function (err, city) {
    if (err) {
      // here is the place to check if a maximum retry has been reached
      q.push(city, decrement(done));
      return;
    }

    scrape_city(city, scrape_city_callback(city, done));
  });
};

// define queue

var q = async.queue(process_city, CONCURRENCY);

// process_cityes

var process_cities = function (cities, done) {
  counter = cities.length;

  cities.forEach(function (city) {
    q.push(city, decrement(done));
  });
};

// retrieve cities

var retrieve_cities = function (next) {
  db.items.find({/*sign: /^[abcdefghilm]/*/}, {last_update: 1}, next);
};

// Main

async.waterfall([
  retrieve_cities,
  process_cities
], function (err, result) {
  if (err) {
    console.log(err);
    process.exit(-1);
  }

  console.log('DONE!');
  process.exit(0);
});
