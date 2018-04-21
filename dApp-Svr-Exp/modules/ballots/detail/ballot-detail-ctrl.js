(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotDetailCtrl',
    ['$http', '$log', '$mdDialog', '$routeParams', '$location', '$mdToast',
    function BallotDetailCtrl($http, $log, $mdDialog, $routeParams, $location, $mdToast) {
      var vm = this;

      vm.back = back;

      vm.ballotId = $routeParams.id;
      vm.ballot = JSON.parse(localStorage.getItem('ballot'));

      function back(){
        $location.path('/ballots')
      }
    }]);
})(); 