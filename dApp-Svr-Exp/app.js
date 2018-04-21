(function() {
    'use strict';
    angular.module('dAppSvrApp', ['ngRoute', 'angular-cache',  'ngMaterial','ngMdIcons','ngMessages'])
    .config(['$routeProvider','CacheFactoryProvider', '$mdThemingProvider', '$locationProvider',
    function($routeProvider, CacheFactoryProvider, $mdThemingProvider, $locationProvider){
      $locationProvider.hashPrefix('');
      $routeProvider
        .when('/ballots', {
          templateUrl: 'modules/ballots/ballots-list.html',
          controller: 'BallotsListCtrl as vm'
        })
        .when('/ballots/:id', {
          templateUrl: 'modules/ballots/detail/ballot-detail.html',
          controller: 'BallotDetailCtrl as vm'
        })
        .otherwise({
          redirectTo: '/ballots'
        });
        $mdThemingProvider.theme('default').primaryPalette('indigo').accentPalette('orange');      
    }]).controller('AppCtrl', ['$scope', '$mdSidenav','$log', function($scope, $mdSidenav, $log){
        $scope.toggleSidenav = function(menuId) {
          $mdSidenav(menuId).toggle();
        };
        $scope.close = function (menuId) {
          // Component lookup should always be available since we are not using `ng-if`
          $mdSidenav(menuId).close()
            .then(function () {
              $log.debug("close "+menuId+" is done");
            });
        };    
    }]);
})();