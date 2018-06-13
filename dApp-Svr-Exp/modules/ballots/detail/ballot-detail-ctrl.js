(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotDetailCtrl',
    ['$http', '$log', '$mdDialog', '$routeParams', '$location', '$mdToast', '$scope', 'apiETH', 'apiIPFS', 'graph',
      function BallotDetailCtrl($http, $log, $mdDialog, $routeParams, $location, $mdToast, $scope, apiETH, apiIPFS, graph) {
        var vm = this;

        vm.back = back;
        vm.vote = vote;
        vm.delegate = delegate;
        vm.removeVote = removeVote;
        vm.removeDelegation = removeDelegation;

        vm.delegationsList = [];

        vm.ballotId = $routeParams.id;
        vm.ballot = JSON.parse(localStorage.getItem('ballot'));

        $scope.users = [];

        populateVoterData();
        populateVoters();

        function calculateTotals() {
          const perc1 = vm.ballot.option1 * 100 / vm.ballot.total || 0;
          const perc2 = vm.ballot.option2 * 100 / vm.ballot.total || 0;
          let width1 = perc1;
          let width2 = perc2;
          if (width1 < 10 ) {
            width1 = 10;
          }
          if (width2 < 10 ) {
            width2 = 10;
          }
          vm.op1 = {
            width: width1,
            desc: 'Yes',
            perc: perc1
          }
          vm.op2 = {
            width: width2,
            desc: 'No',
            perc: perc2
          }

        }

        function getBallot(position) {
          const pos = Number(position);
          console.log("pos", pos);
          apiETH.instance.getBallot(pos).then(function(ballot) {
            const ipfsBallotTitle = ballot[0];
            const owner = ballot[1];
            vm.ballot.option1 = ballot[2].toNumber();
            vm.ballot.option2 = ballot[3].toNumber();
            vm.ballot.total = vm.ballot.option1 + vm.ballot.option2;
            $log.log('Ballot: ', vm.ballot);
            $log.log('Ballot IPFS address: ' + ipfsBallotTitle);
            calculateTotals();
            $scope.$apply();
          });
        }
        getBallot(vm.ballotId);
        /**
         * Populates current voter data
         */
        async function populateVoterData() {
          const voterData = await apiETH.instance.getMyData.call();    
          vm.ballot.voted = voterData[2];
          const representative = voterData[4];  
          vm.ballot.delegated = representative != apiETH.web3.eth.defaultAccount;
        }

        /**
        * It populates voters list, fetches the addresses list from the Contract and
        * creates a request per voter address to fetch IPFS and Contract info. This it's quite inefficient
        * and likely not to scale, so a better approach needs to be taken.
        */
        async function populateVoters() {

          var edges = [];
          var nodes = [];

          console.log("Populating available voters to delegate...");
          const voters = await apiETH.instance.getVoters.call();
          console.log("There are " + voters.length + " voters");
          for (let i = 0; i < voters.length; i++) {
            console.log("Getting voter data " + (i + 1) + " out of " + voters.length);
            const currentVoter = voters[i];
            const voter = await apiETH.instance.getVoterData.call(currentVoter);
            const representative = voter[4];
            const ipfsHash = voter[3];
            const voted = voter[2];
            const voterIpfsHash = apiIPFS.getIpfsHashFromBytes32(ipfsHash);
            console.log("IPFS voter hash: ", voterIpfsHash);

            // Gets the IPFS data and timeouts if not available in the given time
            const file = await Promise.race([
              apiIPFS.node.files.cat(voterIpfsHash),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
            ]).catch(function (err) {
              console.error("Voter data timed out!. Voter: ", i + 1);
              return null;
            })

            // Skips the voter if timeouts
            if (file == null) {
              continue;
            }

            const data = file.toString('utf8');
            const userName = JSON.parse(data).name;
            $scope.users.push(
              {
                name: userName,
                id: currentVoter,
                icon: new Identicon(currentVoter, 30).toString()
              }
            );

            populateGraphFromVoter(nodes, edges, currentVoter, userName, voter, representative, voted);
          }

          const nodesAndEdges = nodes.concat(edges);
          populateDelegationsList(nodesAndEdges);
          
          // Renders graphs
          renderVoteGraphs(nodesAndEdges);
          renderDelegationGraphs(nodesAndEdges);
        }

        /**
         * Populate nodes and edges of the graph according to delegations and votes.
         * NOTE: For visualization purposes, the source and target are inverted, so delegations can be shown as a Tree
         */
        function populateGraphFromVoter(nodes, edges, currentVoter, userName, voter, representative, voted) {
          nodes.push({ group: "nodes", data: { id: currentVoter, name: userName, type: "voter" } });
          if (representative != currentVoter) { // If there is a delegation
            edges.push({ group: "edges", data: { id: representative + "-" + currentVoter, source: representative, target: currentVoter } });
          }
          if (voted) {
            const votedYes = voter[5];
            const votedNo = voter[6];
            if (votedYes) {
              edges.push({ group: "edges", data: { id: currentVoter + "-voted", source: 0, target: currentVoter } });
            } else {
              edges.push({ group: "edges", data: { id: currentVoter + "-voted", source: 1, target: currentVoter } });
            }
          }
        }
        
        /**
         * Populates the delegation list, if there any delegations.
         * Used for appropriate rendering of delegations graphs.
         */
        function populateDelegationsList(nodesAndEdges) {
          var containerCounter = 0;
          var container = '';
          for (var i = 0; i < nodesAndEdges.length; i++) {
            if (nodesAndEdges[i].group == 'edges' && nodesAndEdges[i].data.source != '0' && nodesAndEdges[i].data.source != '1') {
              container = 'delegates-container' + containerCounter;
              vm.delegationsList.push(container);
              containerCounter++;
              
            }
          }
        }

        /**
         * Renders 'Yes' and 'No' graphs
         */
        function renderVoteGraphs(nodesAndEdges) {
          var nodesAndEdgesNew = nodesAndEdges.slice();
          nodesAndEdgesNew.push({ group: "nodes", data: { id: 0, name: "yes", type: "option" } });
          nodesAndEdgesNew.push({ group: "nodes", data: { id: 1, name: "no", type: "option" } });
          renderGraph(nodesAndEdgesNew, 'yes-container', '#9F9', 0);
          renderGraph(nodesAndEdgesNew, 'no-container', '#F99', 1);
        }

        /**
         * Renders delegations graphs
         */
        function renderDelegationGraphs(nodesAndEdges) {
          var mainNode = null;
          var container = null;
          var containerCounter = 0;
          for (var i = 0; i < nodesAndEdges.length; i++) {
            if (nodesAndEdges[i].group == 'edges' && nodesAndEdges[i].data.source != '0' && nodesAndEdges[i].data.source != '1') {
              mainNode = nodesAndEdges[i].data.source;
              container = 'delegates-container' + containerCounter;
              containerCounter++;
              renderGraph(nodesAndEdges, container, '#F99', mainNode);
            }
          }

        }

        /**
         * Renders given graph
         */
        function renderGraph(nodesAndEdges, container, color, mainNode) {
          graph.renderGraph(nodesAndEdges, container, color, mainNode);
        }

        /**
        * Delegate call
        */
        function delegate(delegateValue) {
          console.log("Delegating to " + delegateValue);
          apiETH.instance.delegate(delegateValue, { gas: 1000000 }).then(function (result) {
            console.log("Delegation successful");
          }).catch(function (err) {
            console.log("ERROR delegating:" + err.message);
          });
        }

        /**
         * Removes the currently assigned vote
         */
        function removeVote() {
          apiETH.instance.removeVote({ gas: 1000000 }).then(function (result) {
            console.log("Vote revoked.");
          });
        }

        /**
         * Remove the current delegation
         */
        function removeDelegation() {
          apiETH.instance.revoke({ gas: 1000000 }).then(function (result) {
            console.log("Delegation revoked.");
          });
        }

        /**
         * Vote for an option, currently only to ballot 0.
         * @param {*} voteValue
         */
        function vote(voteValue) {
          var option;
          if (voteValue == "yes") {
            option = 1;
          } else if (voteValue == "no") {
            option = 2;
          } else {
            console.error("Wrong vote value");
            return;
          }

          apiETH.instance.vote(0, option, { gas: 1000000 }).then(function (result) {
            console.log("Vote successful");
          }).catch(function (err) {
            console.log("ERROR voting:" + err.message);
          });
        }

        /**
         * Back button action
         */
        function back() {
          $location.path('/ballots')
        };

      }]);

})(); 