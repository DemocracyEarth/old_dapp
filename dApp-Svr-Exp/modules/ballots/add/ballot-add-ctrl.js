(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotAddCtrl',[
    '$log', '$mdDialog', '$routeParams', '$location', '$mdToast', '$scope', 'apiETH', 'apiIPFS',
    function BallotAddCtrl($log, $mdDialog, $routeParams, $location, $mdToast, $scope, apiETH, apiIPFS) {
      const vm = this;
      vm.back = back;
      vm.add = add;
      vm.userOk = false;

      vm.newBallot = localStorage.getItem('new-ballot') || 'null';
      const user = JSON.parse(localStorage.getItem('user'));
      vm.status =  JSON.parse(localStorage.getItem('tx-status'));

      if (user !== null){
        vm.userOk = true;
      }

      vm.metamaskOn = apiETH.metamaskOn() || false;

      function back() {
        $location.path('/ballots')
      };

      function add(newBallot) {
        vm.newBallot = newBallot;
        vm.newBallot.date = new Date();
        localStorage.setItem('new-ballot', vm.newBallot);
        vm.status = {icon: 'cached', message: 'Adding'};
        localStorage.setItem('tx-status', JSON.stringify(vm.status));
        $log.log('New ballot' + vm.newBallot);
        putBallot(newBallot);
      }

      function putBallot (ballot) {
        apiIPFS.node.files.add(new apiIPFS.node.types.Buffer(JSON.stringify(ballot)), (err, file) => {
          if (err) {
            return $log.error('[IPFS] Error adding file', err, res);
          }
          $log.log('[IPFS] - successfully stored', file[0].hash);
          const validETHHash = apiIPFS.getBytes32FromIpfsHash(file[0].hash);
          apiETH.instance.createNewBallot(validETHHash, {gas: 1000000}).then(function(result) {
            $log.log('[ETH] - New Ballot created:', JSON.stringify(ballot));
            vm.status = {icon: 'done_all', message: 'Completed'};
            localStorage.setItem('tx-status', JSON.stringify(vm.status));
            localStorage.setItem('new-ballot', null);
            vm.newBallot = 'null';
            $scope.$apply();
          }).catch(function(err) {
            $log.log(err.message);
            vm.status = {icon: 'done_all', message: 'Error'};
            localStorage.setItem('tx-status', JSON.stringify(vm.status));
            localStorage.setItem('new-ballot', null);
            vm.newBallot = 'null';
            $scope.$apply();
          });
        });
      }
    }]);
})(); 