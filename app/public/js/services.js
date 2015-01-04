'use strict';

/* Services */

var cinemaServices = angular.module('cinemaServices', []);

cinemaServices.factory('Cinemas', ['$http',
  function ($http) {
    var items;
    return function (done) {
      if (items) {
        done(items);
        return;
      }

      $http.get('/data').
        success(function(data, status, headers, config) {
          items = decode(data);
          done(items);
        }).
        error(function(data, status, headers, config) {
          //handle error
        });
      }
  }]);


/**
 * decoding tools
 */

function compile_item (info) {

}

function decode (json) {
  var cinemas = json.cinemas;
  var films = json.films;
  var cities = json.cities;
  var items = [];
  var counter = 0;

  json.data.forEach(function (city_item) {
    city_item.c = city_item.c || [];
    city_item.p = city_item.p || [];

    city_item.c.forEach(function (film_item) {
      film_item.c.forEach(function (cinema_item) {
        var item = {
          id: counter++,
          title: films[film_item.t],
          cinema: cinemas[cinema_item.n],
          schedule: cinema_item.t,
          type: 'città',
          city: cities[city_item.n]
        };
        item.slug = item.city.toLowerCase() + ' citta città ' + item.title.toLowerCase() + ' ' + item.cinema.toLowerCase();
        items.push(item);
      });
    });

    city_item.p.forEach(function (film_item) {
      film_item.c.forEach(function (cinema_item) {
        var item = {
          id: counter++,
          title: films[film_item.t],
          cinema: cinemas[cinema_item.n],
          schedule: cinema_item.t,
          type: 'provincia',
          city: cities[city_item.n]
        };
        item.slug = item.city.toLowerCase() + ' ' + item.type.toLowerCase() + ' ' + item.title.toLowerCase() + ' ' + item.cinema.toLowerCase();
        items.push(item);
      });
    });
  });
  
  return items;
}
