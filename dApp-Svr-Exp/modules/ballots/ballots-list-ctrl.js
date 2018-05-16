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

      vm.ballotsTest = [
        {
          desc: 'Brexit?',
          author: 'awssi123',
          date: '21-04-2018-18:36:15',
          voted: 1,
          id: 1,
          votes: {
            options: ['Yes', 'No'],
            totals: [46, 84]
          },
          icon: new Identicon('0x7700edddd3fc34c18fe2ab14b5345f1596d10551', 30).toString()
        },
        {
          desc: 'Euro?',
          author: 'aerti123',
          date: '21-04-2018-18:37:15',
          delegated: 5,
          id: 2,
          votes: {
            options: ['Yes', 'No'],
            totals: [84, 46]
          },
          icon: new Identicon('0x39f0B5C5D50AEB7F9Ea8BA003733f8e2678A8017', 30).toString()
        },
        {
          desc: 'Nuclear?',
          author: 'aeyui123',
          date: '21-04-2018-18:38:15',
          open: true,
          id: 3,
          votes: {
            options: ['Yes', 'No'],
            totals: [25, 95]
          },
          icon: new Identicon('0x0473a8fffa27305e60c5d0e78c26d9d1f4321c64', 30).toString()
        }
      ];
      
      vm.ballots = vm.ballotsTest;
      
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

      function addBallot() {
        $location.path('/ballots/add');
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
    }]);
})();