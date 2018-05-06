(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('ProfileCtrl', ['$log', '$window', '$scope', '$mdToast', 'apiETH', 'apiIPFS',
    function ProfileCtrl($log, $window, $scope, $mdToast, apiETH, apiIPFS) {
      const vm = this;
      vm.user = {};

      vm.back = back;
      vm.setProfile = setProfile;
      vm.clearProfile = clearProfile;
      vm.checkConnection = checkConnection;
      
      vm.user = JSON.parse(localStorage.getItem('user'));
      
      $log.info("profile controller", vm.user);

      if(vm.user !== null){
        vm.status = {icon: 'done_all', message: 'Confirmed'};
      }

      checkConnection();

      function back(){
        $window.history.back();
      };

      function setProfile(){
        if (checkConnection()){
          apiIPFS.node.files.add(new apiIPFS.node.types.Buffer(JSON.stringify(vm.user)), (err, cbIPFS) => {
            if (err) {
              return $log.error('Error - ipfs files add', err, res)
            }
            $log.log('profile added to IPFS', cbIPFS);
            vm.user.registered = true;
            $scope.$parent.user = vm.user;
            vm.status = {icon: 'cached', message: 'Verifying'};
            $scope.$apply();
            const validEthHash = apiIPFS.getBytes32FromIpfsHash(cbIPFS[0].hash);
            apiETH.instance.registerNewVoter(validEthHash, {gas: 1000000, gasPrice: 20000000000}).then(function(result) {
              $log.info('New Voter registered:', result);
              vm.user.icon = new Identicon(vm.user.address, 30).toString();
              localStorage.setItem('user', JSON.stringify(vm.user));
              $log.info("vm.user",vm.user);
              $scope.$parent.user = vm.user;
              vm.status = {icon: 'done_all', message: 'Confirmed'};
              $scope.$apply();
            }).catch(function(err) {
              $log.log(err.message);
            });
          });          
        }
      }
      function clearProfile(address){
        if (checkConnection()){
          localStorage.setItem('user', null);
          vm.user = null;
          $scope.$parent.user = null;
          // Call to ETH
          apiETH.instance.resetVoter({gas: 1000000, gasPrice: 20000000000}).then(function(result) {
            $log.info('voter deleted:', result);
          }).catch(function(err) {
            $log.log(err.message);
          });
        }
      }

      function checkConnection() {
        vm.metamaskOn = apiETH.metamaskOn() || false;
        if (vm.metamaskOn && vm.user === null) {
          vm.user = {
            address: apiETH.web3.eth.defaultAccount
          };
        }
        return vm.metamaskOn;
      }
    }]);
})();
