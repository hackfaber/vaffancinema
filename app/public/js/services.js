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
 * decoding tool
 */

function decode (data) {
  var cinemas = data.cinemas;
  var films = data.films;
  var cities = data.cities;
  var items = [];

  data.data.forEach(function (data_item) {
    data_item.forEach(function (data_mapped_item) {
        data_mapped_item.films.forEach(function (film_item) {
          film_item.cinemas.forEach(function (cinema_item) {
          var item = {
            title: films[film_item.title],
            cinema: cinemas[cinema_item.name],
            schedule: cinema_item.time,
            type: data_mapped_item.type,
            city: cities[data_mapped_item.city]
          };
          item.slug = item.city + ' ' + item.type + ' ' + item.title + ' ' + item.cinema;
          items.push(item);
        });
      });
    });
  });
  return items;
}
