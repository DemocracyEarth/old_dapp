(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('ProfileCtrl', ['$log', '$window', '$scope', '$mdToast', 'apiETH', 'apiIPFS',
    function ProfileCtrl($log, $window, $scope, $mdToast, apiETH, apiIPFS) {
      var vm = this;
      vm.profile = {};
      vm.user = {};
      vm.back = back;
      vm.setProfile = setProfile;
      vm.clearProfile = clearProfile;
      
      vm.profile = vm.user = JSON.parse(localStorage.getItem('user'));

      $log.info("profile controller");

      function back(){
        $window.history.back();
      };

      function setProfile(){
        vm.profile.icon = new Identicon(vm.profile.address, 30).toString(),
        localStorage.setItem('user', JSON.stringify(vm.profile));
        $log.info("vm.user",vm.profile);
        vm.user = vm.profile;
        $scope.$parent.user = vm.user;
        // Call to IPFS
        // Call to ETH
      }
      function clearProfile(){
        localStorage.setItem('user', null);
        vm.user = null;
        vm.profile = null;
        $scope.$parent.user = null;
        // Call to IPFS
        // Call to ETH
      }
    }]);
})();
