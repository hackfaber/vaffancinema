'use strict';

/* Controllers */

var cinemaControllers = angular.module('cinemaControllers', []);

// cinemaControllers.controller('cinemaSearchCtrl', ['$scope', 'Cinemas',
//   function($scope, Cinemas) {
//     $scope.data = Cinemas.query();
//   }
// ]);

cinemaControllers.controller('cinemaSearchCtrl', ['$scope', 'Cinemas',
  function($scope, Cinemas) {

    $scope.items = [];

    $scope.on_change = function () {
      var query = this.query.toLowerCase();
      var re = new RegExp(query.replace(/ /g, '.+'));
      if (query.length < 3) {
        this.items.forEach(function (item) {
          item.hit = false;
        });
      } else {
        this.items.forEach(function (item) {
          item.hit = re.test(item.slug);
        });
      }
    };

    $scope.blur = function () {
      document.querySelector('input.search').blur();
    };

    Cinemas(function (items) { $scope.items = items; });
  }
]);

// cinemaControllers.controller('cinemaResultsCtrl', ['$scope',
//   function($scope) {
//     $scope.items = [];
//   }
// ]);

// PROTOCOLLO richiesta dati
// chiedi data ultimo aggiornamento al server // /api/lastUpdate
// esiste local-storage -> no: scarica ultimi dati
// esiste local-storage -> si: i dati sono aggiornati? no: scarica ultimi dati
// esiste local-storage -> si: i dati sono aggiornati? si: utilizza dati in local-storage
