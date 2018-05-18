(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotsListCtrl', ['$log', '$mdDialog', '$location', '$scope', '$mdToast', 'apiETH', 'apiIPFS',
    function BallotsListCtrl($log, $mdDialog, $location, $scope, $mdToast, apiETH, apiIPFS) {
      var vm = this;
      vm.addBallot = addBallot;
      vm.ballotDetail = ballotDetail;
      vm.filterBallots = filterBallots;
      vm.getStatus = getStatus;
      vm.getTotalVotes = getTotalVotes;
      vm.getOption = getOption;
      vm.getWidth = getWidth;
      vm.selected = localStorage.getItem('filter') || 'all';

      vm.ballots = [];
      
      function getStatus(ballot) {
          if (ballot.open)
            return 'You haven\'t voted or delegated yet';
          else if (ballot.voted)
            return `You voted here ${ballot.voted}`;
          else if (ballot.delegated)
            return `You delegated here ${ballot.delegated}`;
          else {
            return 'You haven\'t voted or delegated yet';
          }
      }

      function filterBallots() {
        if (vm.selected !== 'all') {
          vm.ballots = vm.ballotsTest.filter(ballot => ballot[vm.selected]);
        } else {
          vm.ballots = vm.ballotsTest;
        }
        localStorage.setItem('filter', vm.selected);
      }
      filterBallots();

      function getTotalVotes(votes) {
        return votes.totals.reduce((a, b) => a + b, 0);
      }

      function getOption(votes, pos) {
        const totalVoted = getTotalVotes(votes);
        const desc = votes.options[pos-1];
        const total = getPorcent(totalVoted, votes.totals[pos-1]);
        return `${desc} ${total}%`;
      }

      function getWidth(votes, pos) {
        const total = getTotalVotes(votes) + 10;
        return getPorcent(total, votes.totals[pos-1]);
      }
      function getPorcent(total, number) {
        const porcent = number * 100 / total;
        return porcent.toFixed(2);
      }

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
                    icon: new Identicon(ballotOwner, 30).toString(),
                    votes: {
                      options: ['Yes', 'No'],
                      totals: [Math.floor(Math.random()*100), Math.floor(Math.random()*100)]
                    }
                });
                $scope.$apply();
                $log.log(vm.ballots);
            });
          }
        });
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
        apiETH.instance.getLastBallot.call().then(function(ballot) {
          const ipfsBallotTitle = ballot[0];
          const owner = ballot[1];
          $log.log('Ballot: ', ballot);
          $log.log('Ballot IPFS address: ' + ipfsBallotTitle);
          const validIpfsAddress = apiIPFS.getIpfsHashFromBytes32(ipfsBallotTitle);
          $log.log("Valid IPFS address: ", validIpfsAddress);

          apiIPFS.node.files.cat(validIpfsAddress, function (err, file) {
            if (err) throw err;
            const data = file.toString('utf8');
            $log.log("Ballot data: ", data);
            const ballotTitle = JSON.parse(data).desc;
            $log.log("Ballot title: " + ballotTitle);
            callback(ballotTitle, owner);
          });
        });
      }

      function putBallot (ballot) {
        apiIPFS.node.files.add(new apiIPFS.node.types.Buffer(JSON.stringify(ballot)), (err, filesAdded) => {
          if (err) {
            return $log.error('[IPFS] - Error - ipfs files add', err, res);
          }
          $log.log('[IPFS] - filesAdded', filesAdded);
          filesAdded.forEach((file) => {
            $log.log('[IPFS] - successfully stored', file.hash);
            const ipfsHashEncoded = apiIPFS.getBytes32FromIpfsHash(file.hash)
            $log.log("ETH byte32: " + ipfsHashEncoded);
            apiETH.instance.createNewBallot(ipfsHashEncoded, {gas: 1000000}).then(function(result) {
              $log.log('[ETH] - New Ballot created:', JSON.stringify(ballot));
            }).catch(function(err) {
              $log.log(err.message);
            });
          })
        });
      }
    }]);
})();