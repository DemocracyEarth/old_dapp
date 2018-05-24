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
        .when('/ballots/add', {
          templateUrl: 'modules/ballots/add/ballot-add.html',
          controller: 'BallotAddCtrl as vm'
        })
        .when('/ballots/:id', {
          templateUrl: 'modules/ballots/detail/ballot-detail.html',
          controller: 'BallotDetailCtrl as vm'
        })
        .when('/profile', {
          templateUrl: 'modules/user/profile.html',
          controller: 'ProfileCtrl as vm'
        })
        .otherwise({
          redirectTo: '/ballots'
        });
        $mdThemingProvider.theme('default').primaryPalette('indigo').accentPalette('orange');      
    }]).controller('AppCtrl', ['$scope', '$mdSidenav', '$log', '$location', function($scope, $mdSidenav, $log, $location){
        $scope.toggleSidenav = function (menuId) {
          $mdSidenav(menuId).toggle();
        };
        $scope.close = function (menuId) {
          $mdSidenav(menuId).close()
            .then(function () {
              $log.debug("close "+menuId+" is done");
            });
        };
        $scope.user = JSON.parse(localStorage.getItem('user'));
        $scope.profile = function () {
          $location.path('/profile/');
        }
    }]);
})();