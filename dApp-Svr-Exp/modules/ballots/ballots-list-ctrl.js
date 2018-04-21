(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotsListCtrl', ['$http', '$log', '$mdDialog', '$location','$scope', '$mdToast',
    function BallotsListCtrl($http, $log, $mdDialog, $location, $scope, $mdToast) {
      var vm = this;
     
      vm.addBallot = addBallot;
      vm.ballotDetail = ballotDetail;
      vm.filterBallots = filterBallots
      vm.selected = 'all';

      vm.ballotOptions = [{
        id: "speaker_notes",
        title: 'View all ballots',
        value: 'all'
      },{
        id: "swap_vertial_circle",
        title: 'View ballots you\'ve voted on',
        value: 'voted'
      },{
        id: "avatars:svg-3",
        title: 'View ballots with delegated votes',
        value: 'delegated'
    }];


      vm.ballotsTest=[
        {
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          author: 'awssi123',
          date: '21-04-2018-18:36:15',
          voted: true,
          id: 1
        },
        {
          desc: 'Nulla venenatis ante augue.',
          author: 'aerti123',
          date: '21-04-2018-18:37:15',
          delegated: true,
          id: 2
        },
        {
          desc: 'Phasellus volutpat neque ac dui mattis vulputate.',
          author: 'aeyui123',
          date: '21-04-2018-18:38:15',
          id: 3
        }
      ];
      vm.ballots = vm.ballotsTest;
      function filterBallots (filterOption) {
        if (filterOption !== 'all'){
          vm.ballots = ballotsTest.filter(ballot => {
            ballot[filterOption] === true;
          })
        } else {
          vm.ballots = ballotsTest
        }
      }

      function NewBallotDialogCtrl ($scope, $mdDialog) {
        $scope.hide = function() {
          $mdDialog.hide();
        };
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
          console.log("data", answer)
        };
      };

      function addBallot(ev) {
        $mdDialog.show({
          controller: NewBallotDialogCtrl,
          templateUrl: '../modules/ballots/add/ballot.html',
          targetEvent: ev,
          clickOutsideToClose: true
        })
        .then(function(newBallot) {
          if (newBallot === undefined) {
            $log.log( 'You cancelled the dialog.');
          } else {
            $log.log( 'New ballot' + newBallot);
            // potBallot()
          }
        }, function(err) {
          $log.log( 'addCoin modal error:', err);
        });
      };

      function ballotDetail(ballot) {
        $location.path('/ballots/' + ballot.id)
        localStorage.setItem('ballot', JSON.stringify(ballot));
      };


      function getBallots () {
        // get ballots from ETH
        // get ballots from IPFS
      }

      function potBallot (coin) {
        // add ballot to ETH
        // add ballot to IPFS
      }
    }]);
})(); 