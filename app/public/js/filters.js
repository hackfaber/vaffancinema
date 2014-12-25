'use strict';

/* Filters */

angular.module('cinemaFilters', []).filter('hit', function () {
  return function (items) {
    return items.filter(function (item) {
      return item.hit;
    });
  };
});
