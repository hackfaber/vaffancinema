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
    $scope.indexes = [];

    $scope.worker = new Worker('./js/worker-finder.js');

    $scope.worker.onmessage = function (e) {
      if (Object.prototype.toString.call(e.data) === '[object String]' && e.data === 'done') {
        $scope.$apply(function () {});
        return;
      }
      Array.prototype.push.apply($scope.indexes, e.data);
      e.data.forEach(function (indx) {
        $scope.items[indx].hit = true;
      });
    };

    $scope.on_change = function () {
      $scope.indexes.forEach(function (indx) {
        $scope.items[indx].hit = false;
      });
      $scope.indexes = [];
      $scope.worker.postMessage(this.query);
      return;
    };

    $scope.blur = function () {
      document.querySelector('input.search').blur();
    };

    Cinemas(function (items) {
      $scope.items = items;
      $scope.worker.postMessage(items);
    });
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
