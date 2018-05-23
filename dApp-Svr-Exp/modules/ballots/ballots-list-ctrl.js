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
          vm.ballots = vm.ballots.filter(ballot => ballot[vm.selected]);
        } else {
          vm.ballots = vm.ballots;
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
        const total = getPercentage(totalVoted, votes.totals[pos-1]) || 0;
        return `${desc} ${total}%`;
      }

      function getWidth(votes, pos) {
        const total = getTotalVotes(votes);
        if (total < 5) return 50;
        return getPercentage(total || 50, votes.totals[pos-1]);
      }
      function getPercentage(total, number) {
        if (total === 0) return 0;
        const porcent = number * 100 / total;
        return porcent.toFixed(0);
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
          if (ballots > 0) {
            for(let ballotPos = 0; ballotPos < ballots; ballotPos++ ) {
              getBallots(ballotPos, function (err, ballot) {
                if (!err) {
                  $log.log(vm.ballots);
                  vm.ballots.push({
                      id: ballotPos,
                      desc: ballot.desc,
                      date: ballot.date,
                      icon: new Identicon(ballot.owner, 30).toString(),
                      votes: {
                        options: ['Yes', 'No'],
                        totals: [ballot.option1, ballot.option2]
                      }
                  });
                  $scope.$apply();
                  $log.log(vm.ballots);
                }
              });
            }
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
      async function getBallots (position, callback) {
        const ethBallot = await apiETH.instance.getBallot(position);
        $log.log('[ETH] - Ballot: ', ethBallot);
        if(ethBallot[0] !== '0x'){
          const ballot = {
            ipfsHash: apiIPFS.getIpfsHashFromBytes32(ethBallot[0]),
            owner: ethBallot[1],
            option1: ethBallot[2].toNumber(),
            option2: ethBallot[3].toNumber()
          }
          $log.log('ballot', ballot);

          const file = await apiIPFS.node.files.cat(ballot.ipfsHash);
          const data = file.toString('utf8');
          $log.log("[IPFS] - Ballot data: ", data);
          ballot.desc = JSON.parse(data).desc;
          ballot.date = JSON.parse(data).date;
          $log.log("Ballot detail: " + ballot);
          callback(null, ballot);
        } else {
          callback('No address', null);
        }
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