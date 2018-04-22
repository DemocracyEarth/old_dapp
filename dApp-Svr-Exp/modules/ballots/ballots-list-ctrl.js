(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotsListCtrl', ['$http', '$log', '$mdDialog', '$location','$scope', '$mdToast',
    function BallotsListCtrl($http, $log, $mdDialog, $location, $scope, $mdToast) {
      var vm = this;

      // WEB 3 initialization
      var web3Provider;
      if (typeof web3 !== 'undefined') {
          console.info("Web3 instance defined by Metamask or related")
          web3Provider = web3.currentProvider;
      } else {
          console.info("Web3 instance not defined, connecting in read-only mode to the blockchain using an infura node")
          web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/KZSQapS5wjr4Iw7JhgtE'); // TODO: Using @aecc's key to connect to a Ropsten node, change to our own node
      }

        try {
            const web3 = new Web3(web3Provider);

            web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    console.log(error);
                }
                var account = accounts[0];
                web3.eth.defaultAccount = account;
            })

        } catch (e) {
            console.error(e);
        }

        // Contract loading
        $.getJSON('contracts/LiquidDemocracy.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            console.info("Loading json contract...: " + data);

            const contract = TruffleContract(data);

            // Set the provider for our contract
            contract.setProvider(web3Provider);

            // Simple API call to the contract
            contract.deployed().then(function(instance) {
                instance.getBallotCount.call().then(function(ballots) {
                    console.info("There are " + ballots + " ballots");
                });
            });
            return;
        });
     
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
            // putBallot()
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
        const node = new Ipfs({ repo: 'ipfs-' + 1 });
            node.once('ready', () => {
            // get ipfsBallotTitle from ETH
            const ipfsBallot = 'QmQzCQn4puG4qu8PVysxZmscmQ5vT1ZXpqo7f58Uh9QfyY'; // TODO fetch from ethereum
            node.files.cat(ipfsBallot, function (err, data) {
              console.log("IPFS: " + data); // TODO: use this data to populate the ballot title
              if (err) {
                  console.log('Error - ipfs files cat', err, res)
              }
            });
        });
      }

      getBallots ();

      function putBallot (coin) {
        const node = new Ipfs({ repo: 'ipfs-' + 1 });
        node.once('ready', () => {
            node.files.add(new node.types.Buffer(coin), (err, filesAdded) => {
                if (err) {
                  return console.error('Error - ipfs files add', err, res)
                }
                filesAdded.forEach((file) => console.log('successfully stored', file.hash)) // TODO use this hash in ethereum
            });
        });
        // TODO: add ballot to ETH including file.hash as ipfsBallotTitle
      }
    }]);
})(); 