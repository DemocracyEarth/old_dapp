(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotAddCtrl',[
    '$log', '$mdDialog', '$routeParams', '$location', '$mdToast', '$scope', 'apiETH', 'apiIPFS',
    function BallotAddCtrl($log, $mdDialog, $routeParams, $location, $mdToast, $scope, apiETH, apiIPFS) {
      var vm = this;
      vm.back = back;
      vm.add = add;

      function back() {
        $location.path('/ballots')
      };

      function add(newBallot) {
        newBallot.date = new Date();
        $log.log('New ballot' + newBallot);
        putBallot(newBallot);
      }

      function putBallot (ballot) {
        apiIPFS.node.files.add(new apiIPFS.node.types.Buffer(JSON.stringify(ballot)), (err, file) => {
          if (err) {
            return $log.error('Error - ipfs files add', err, res);
          }
          $log.log('successfully stored', file[0].hash);
          const validETHHash = apiIPFS.getBytes32FromIpfsHash(file[0].hash)
          $log.log("ETH byte32: " + validETHHash);
          apiETH.instance.createNewBallot(validETHHash, {gas: 1000000}).then(function(result) {
            $log.log('New Ballot created:', JSON.stringify(ballot));
          }).catch(function(err) {
            $log.log(err.message);
          });
        });
      }
    }]);
})(); 