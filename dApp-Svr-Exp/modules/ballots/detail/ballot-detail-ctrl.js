(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotDetailCtrl',
    ['$http', '$log', '$mdDialog', '$routeParams', '$location', '$mdToast', '$scope', 'apiETH', 'apiIPFS', 'graph',
      function BallotDetailCtrl($http, $log, $mdDialog, $routeParams, $location, $mdToast, $scope, apiETH, apiIPFS, graph) {
        var vm = this;

        vm.back = back;
        vm.vote = vote;
        vm.delegate = delegate;
        vm.revokeVote = revokeVote;
        vm.revokeDelegation = revokeDelegation;

        vm.ballotId = $routeParams.id;
        vm.ballot = JSON.parse(localStorage.getItem('ballot'));

        $scope.users = [];

        populateVoters();
        renderYesGraph();
        renderNoGraph();

        function back() {
          $location.path('/ballots')
        };

        /**
         * Renders 'Yes' delegations graph
         */
        function renderYesGraph() {
          // TODO: populating with dummy data atm
          var nodesAndEdgesYes = [];
          nodesAndEdgesYes.push({ group: "nodes", data: { id: 0, name: "yes", type: "option" } });
          for (let i = 2; i < 6; i++) {
            let voterName = "Voter " + i;
            nodesAndEdgesYes.push({ group: "nodes", data: { id: i, name: voterName, type: "voter" } });
          }

          for (let j = 2; j < 4; j++) {
            const id = j + 100
            nodesAndEdgesYes.push({ group: "edges", data: { id: id, source: 0, target: j } });
          }
          for (let j = 4; j < 6; j++) {
            const id = j + 100
            let k = j - 2
            nodesAndEdgesYes.push({ group: "edges", data: { id: id, source: k, target: j } });
          }

          graph.renderGraph(nodesAndEdgesYes, 'yes-container', '#9F9');
        }

        /**
         * Renders 'No' delegations graph
         */
        function renderNoGraph() {
          // TODO: populating with dummy data atm          
          var nodesAndEdgesNo = [];
          nodesAndEdgesNo.push({ group: "nodes", data: { id: 1, name: "no", type: "option" } });
          for (let i = 9; i < 19; i++) {
            let voterName = "Voter " + i;
            nodesAndEdgesNo.push({ group: "nodes", data: { id: i, name: voterName, type: "voter" } });
          }

          for (let j = 9; j < 12; j++) {
            const id = j + 100
            let k = 1
            nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: k, target: j } });
          }
          for (let j = 12; j < 17; j++) {
            const id = j + 100
            let k = j - 2
            nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: k, target: j } });
          }
          for (let j = 17; j < 19; j++) {
            const id = j + 100
            let k = 16
            nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: k, target: j } });
          }

          graph.renderGraph(nodesAndEdgesNo, 'no-container', '#F99');
        }

        /**
        * It populates voters list, fetches the addresses list from the Contract and
        * creates a request per voter address to fetch IPFS and Contract info. This it's quite inefficient
        * and likely not to scale, so a better approach needs to be taken.
        */
        async function populateVoters() {

          console.log("Populating available voters to delegate...");
          const voters = await apiETH.instance.getVoters.call();
          console.log("There are " + voters.length + " voters");
          for (let i = 0; i < voters.length; i++) {
            const voter = await apiETH.instance.getVoterData.call(voters[i]);
            const voterIpfsName = apiIPFS.getIpfsHashFromBytes32(voter[3]);
            apiIPFS.node.files.cat(voterIpfsName, function (err, file) {
              if (err) {
                throw err
              }
              const data = file.toString('utf8');
              console.log(data);
              const userName = JSON.parse(data).desc;
              $scope.users.push(
                {
                  name: userName,
                  id: voters[i],
                  icon: new Identicon(voters[i], 30).toString()
                }
              );
            });
          }
        }

        /**
        * Delegate call
        */
        function delegate(delegateValue) {
          console.log("Delegating to " + delegateValue);
          apiETH.instance.delegate(delegateValue).then(function (result) {
            console.log("Delegation successful");
          }).catch(function (err) {
            console.log("ERROR delegating:" + err.message);
          });
        }

        function revokeVote() {
          console.log("revoke vote");
          // TODO: Call ETH revoke vote
        }

        function revokeDelegation() {
          console.log("revoke delegation");
          // TODO: Call ETH revoke delegation
        }

        function vote(voteValue) {
          // TODO: call ETH vote
          console.log(voteValue);
        }

      }]);

})(); 