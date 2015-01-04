var mongojs = require('mongojs');
var db = mongojs('vaffancinema', ['items']);

var cities = [];
var films = [];
var cinemas = [];

var items = [];

var add_to_set = function (set, item) {
  var index = set.indexOf(item);
  if (index === -1) {
    index = set.push(item) - 1;
  }
  return index;
};

var map_films = function (pictures) {
  return pictures.map(function (picture) {
    return {
      t: add_to_set(films, picture.title),
      c: picture.cinemas.map(function (cinema) {
        return {
          n: add_to_set(cinemas, cinema.name),
          t: cinema.time
        };
      })
    };
  });
};

/**
 * Module exports
 *
 */

var update_json = module.exports =  function (done) {
  db.items.find(function (err, res) {
    if (err) {
      done(err);
      return;
    }

    items = res.map(function (item) {
      return {
        // id: item._id,
        n: add_to_set(cities, item.name),
        c: map_films(item.films_in_city),
        p: map_films(item.films_in_province),
        lu: item.last_update
      };
    });
      
    
    var json = {
      cities: cities,
      films: films,
      cinemas: cinemas,
      data: items
    };

    setImmediate(done, null, json);
  });
};
