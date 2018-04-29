(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotsListCtrl', ['$log', '$mdDialog', '$location', '$scope', '$mdToast', 'apiETH', 'apiIPFS',
    function BallotsListCtrl($log, $mdDialog, $location, $scope, $mdToast, apiETH, apiIPFS) {
      var vm = this;
      vm.addBallot = addBallot;
      vm.ballotDetail = ballotDetail;
      vm.filterBallots = filterBallots
      vm.selected = 'all';

      vm.ballotsTest = [
        {
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          author: 'awssi123',
          date: '21-04-2018-18:36:15',
          voted: true,
          id: 1,
          icon: new Identicon('0x7700edddd3fc34c18fe2ab14b5345f1596d10551', 30).toString()
        },
        {
          desc: 'Nulla venenatis ante augue.',
          author: 'aerti123',
          date: '21-04-2018-18:37:15',
          delegated: true,
          id: 2,
          icon: new Identicon('0x39f0B5C5D50AEB7F9Ea8BA003733f8e2678A8017', 30).toString()
        },
        {
          desc: 'Phasellus volutpat neque ac dui mattis vulputate.',
          author: 'aeyui123',
          date: '21-04-2018-18:38:15',
          id: 3,
          icon: new Identicon('0x0473a8fffa27305e60c5d0e78c26d9d1f4321c64', 30).toString()
        }
      ];
      vm.ballots = vm.ballotsTest;
      if(apiETH.instance === undefined) {
        apiETH.loadContract().then(function (contract){
          apiETH.contract = contract;
          apiETH.checkInstance(contract).then(function(instance) {
            apiETH.instance = instance;
            loadBallots();
          })
        });
      } else {
        loadBallots();
      }
      if(apiIPFS.node === undefined){
        apiIPFS.initializeNode(function(node){
          apiIPFS.node = node;
        });
      }
      function loadBallots(){
        apiETH.instance.getBallotCount.call().then(function(ballots) {
          $log.info("There are " + ballots + " ballots");
          // TODO: supporting a single ballot atm
          if (ballots == 0) {
            vm.ballots = [];
          } else {
            getBallots(function (ballotTitle, ballotOwner) {
                $log.log(vm.ballots);
                vm.ballots.push({
                    id: ballots - 1,
                    desc: ballotTitle,
                    icon: new Identicon(ballotOwner, 30).toString()
                });
                $scope.$apply();
                $log.log(vm.ballots);
            });
          }
        });
      }
      function filterBallots(filterOption) {
        if (filterOption !== 'all') {
          vm.ballots = ballotsTest.filter(ballot => {
            ballot[filterOption] === true;
          })
        } else {
          vm.ballots = ballotsTest
        }
      }

      function NewBallotDialogCtrl($scope, $mdDialog) {
        $scope.hide = function () {
          $mdDialog.hide();
        };
        $scope.cancel = function () {
          $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
          $mdDialog.hide(answer);
          $log.log("data", answer)
        };
      };

      function addBallot(ev) {
        $mdDialog.show({
          controller: NewBallotDialogCtrl,
          templateUrl: '../modules/ballots/add/ballot.html',
          targetEvent: ev,
          clickOutsideToClose: true
        })
          .then(function (newBallot) {
            if (newBallot === undefined) {
              $log.log('You cancelled the dialog.');
            } else {
              newBallot.date = new Date();
              $log.log('New ballot' + newBallot);
              putBallot(newBallot);
            }
          }, function (err) {
            $log.error('addBallot modal error:', err);
          });
      };

      function ballotDetail(ballot) {
        $location.path('/ballots/' + ballot.id);
        localStorage.setItem('ballot', JSON.stringify(ballot));
      };

      // TODO: only getting last ballot atm
      function getBallots (callback) {
        //apiIPFS.node.once('ready', () => {
          apiETH.instance.getLastBallot.call().then(function(ballot) {
            const ipfsBallotTitle = ballot[0];
            const owner = ballot[1];
            $log.log('Ballot: ', ballot);
            $log.log('Ballot IPFS address: ' + ipfsBallotTitle);
            const validIpfsAddress = apiIPFS.getIpfsHashFromBytes32(ipfsBallotTitle);
            $log.log("Valid IPFS address: ", validIpfsAddress);

            apiIPFS.node.files.cat(validIpfsAddress, function (err, file) {
              if (err) {
                throw err
              }
              const data = file.toString('utf8');
              $log.log("Ballot data: ", data);
              const ballotTitle = JSON.parse(data).desc;
              $log.log("Ballot title: " + ballotTitle);
              callback(ballotTitle, owner);
            });
          });
        //});
      }

      function putBallot (ballot) {
        
        //apiIPFS.node.once('ready', () => {
          apiIPFS.node.files.add(new apiIPFS.node.types.Buffer(JSON.stringify(ballot)), (err, filesAdded) => {
            if (err) {
              return $log.error('Error - ipfs files add', err, res)
            }
            $log.log('filesAdded', filesAdded);
            filesAdded.forEach((file) => {
              $log.log('successfully stored', file.hash);
              const validETHHash = apiIPFS.getBytes32FromIpfsHash(file.hash)
              $log.log("ETH byte32: " + validETHHash);
              apiETH.instance.createNewBallot(validETHHash, {gas: 1000000}).then(function(result) {
                $log.log('New Ballot created:', JSON.stringify(ballot));
              }).catch(function(err) {
                $log.log(err.message);
              });

            })
          });
        //});
      }

    }]);
})();