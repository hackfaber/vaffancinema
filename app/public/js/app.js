'use strict';

/* App Module */

var cinemaApp = angular.module('cinemaApp', [
  // 'ngRoute',
  // 'cinemaAnimations',

  'cinemaControllers',
  'cinemaFilters',
  'cinemaServices',
  'cinemaDirectives'
]);

// cinemaApp.config(['$routeProvider',
//   function($routeProvider) {
//     $routeProvider
//       .when('/search/:query', {
//         templateUrl: 'partials/results.html',
//         controller: 'resultsCtrl'
//       })
//       .otherwise({
//         redirectTo: '/search'
//       });
//   }]);
