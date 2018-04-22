(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotsListCtrl', ['$http', '$log', '$mdDialog', '$location', '$scope', '$mdToast',
    function BallotsListCtrl($http, $log, $mdDialog, $location, $scope, $mdToast) {
      var vm = this;
      vm.addBallot = addBallot;
      vm.ballotDetail = ballotDetail;
      vm.filterBallots = filterBallots
      vm.selected = 'all';

      let contract;

        // Return bytes32 hex string from base58 encoded ipfs hash,
        // stripping leading 2 bytes from 34 byte IPFS hash
        // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
        // E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
        // "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"

        function getBytes32FromIpfsHash(ipfsListing) {
          return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
        }

        // Return base58 encoded ipfs hash from bytes32 hex string,
        // E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
        // --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"

        function getIpfsHashFromBytes32(bytes32Hex) {
          // Add our default ipfs values for first 2 bytes:
          // function:0x12=sha2, size:0x20=256 bits
          // and cut off leading "0x"
          const hashHex = "1220" + bytes32Hex.slice(2)
          const hashBytes = Buffer.from(hashHex, 'hex');
          const hashStr = bs58.encode(hashBytes)
          return hashStr
        }

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

            contract = TruffleContract(data);

            // Set the provider for our contract
            contract.setProvider(web3Provider);

            // Simple API call to the contract
            contract.deployed().then(function(instance) {
                instance.getBallotCount.call().then(function(ballots) {
                    console.info("There are " + ballots + " ballots");

            // TODO: supporting a single ballot atm
              if (ballots == 0) {
                vm.ballots = [];
              } else {
                getBallots(function (ballotTitle) {
                    console.log(vm.ballots);
                    vm.ballots.push({
                        id: ballots - 1,
                        desc: ballotTitle
                    });
                    console.log(vm.ballots);
                });
              }


                });
            });
            return;
        });

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
          .then(function (newBallot) {
            if (newBallot === undefined) {
              $log.log('You cancelled the dialog.');
            } else {
              $log.log('New ballot' + newBallot);
              putBallot(newBallot);
            }
          }, function (err) {
            $log.log('addCoin modal error:', err);
          });
      };

      function ballotDetail(ballot) {
        $location.path('/ballots/' + ballot.id)
        localStorage.setItem('ballot', JSON.stringify(ballot));
      };

    // TODO: only getting last ballot atm
      function getBallots (callback) {
        const node = new Ipfs({ repo: 'ipfs-' + 1 });
            node.once('ready', () => {
            contract.deployed().then(function(instance) {
                  instance.getLastBallot.call().then(function(ipfsAddress) {
                    console.log('Ballot IPFS address: ' + ipfsAddress);
                    const validIpfsAddress = getIpfsHashFromBytes32(ipfsAddress);
                    console.log("Valid IPFS address: ", validIpfsAddress);

                    node.files.cat(validIpfsAddress, function (err, file) {
                     if (err) {
                       throw err
                     }
                      const data = file.toString('utf8');
                      console.log("Ballot data: ", data);
                      const ballotTitle = JSON.parse(data).desc;
                      console.log("Ballot title: " + ballotTitle);
                      callback(ballotTitle);
                    });
                  });
            });
        });
      }

      function putBallot (ballot) {
        const node = new Ipfs({ repo: 'ipfs-' + 1 });
        node.once('ready', () => {
            node.files.add(new node.types.Buffer(JSON.stringify(ballot)), (err, filesAdded) => {
                if (err) {
                  return console.error('Error - ipfs files add', err, res)
                }
                console.log('filesAdded', filesAdded);
                filesAdded.forEach((file) => {
                  console.log('successfully stored', file.hash);
                  contract.deployed().then(function(instance) {
                      const validETHHash = getBytes32FromIpfsHash(file.hash)
                      console.log("ETH byte32: " + validETHHash);
                      instance.createNewBallot(validETHHash, {gas: 1000000}).then(function(result) {
                        console.log('New Ballot created:', JSON.stringify(ballot));
                      }).catch(function(err) {
                         console.log(err.message);
                      });
                  });

                })
            });
        });
      }

    }]);
})();