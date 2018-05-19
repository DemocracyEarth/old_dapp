(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotDashboardCtrl',
    ['$log', '$mdDialog', '$routeParams', '$location', '$mdToast', '$scope', 'apiETH', 'apiIPFS', 'graph',
    function BallotDashboardCtrl($log, $mdDialog, $routeParams, $location, $mdToast, $scope, apiETH, apiIPFS, graph) {
      var vm = this;

      vm.back = back;
      vm.vote = vote;
      vm.delegate = delegate;
      vm.revokeVote = revokeVote;
      vm.revokeDelegation = revokeDelegation;
      vm.getTotalVotes = getTotalVotes;
      vm.getWidth = getWidth;
      vm.ballotId = $routeParams.id;
      vm.ballot = JSON.parse(localStorage.getItem('ballot'));

      vm.action = 1;
      vm.graph = 1;

      vm.setTab = function (type, tabId) {
        vm[type] = tabId;
      };

      vm.tabIsSet = function (type, tabId) {
          return vm[type] === tabId;
      };

      $scope.users = [];

      function getTotalVotes(votes) {
        return votes.totals.reduce((a, b) => a + b, 0);
      }

      function getWidth(votes, pos) {
        const total = getTotalVotes(votes) + 10;
        return getPorcent(total, votes.totals[pos-1]);
      }
      function getPorcent(total, number) {
        const porcent = number * 100 / total;
        return porcent.toFixed(2);
      }
      populateVoters();

      /**
       * Renders 'Yes' delegations graph
       */
      function renderYesGraph(nodesAndEdges) {
        var nodesAndEdgesYes = nodesAndEdges.slice();
        nodesAndEdgesYes.push({ group: "nodes", data: { id: 0, name: "yes", type: "option" } });
        nodesAndEdgesYes.push({ group: "nodes", data: { id: 1, name: "no", type: "option" } });

        graph.renderGraph(nodesAndEdgesYes, 'yes-container', '#9F9', 0);
      }

      /**
       * Renders 'No' delegations graph
       */
      function renderNoGraph(nodesAndEdges) {
        var nodesAndEdgesNo = nodesAndEdges.slice();
        nodesAndEdgesNo.push({ group: "nodes", data: { id: 0, name: "yes", type: "option" } });
        nodesAndEdgesNo.push({ group: "nodes", data: { id: 1, name: "no", type: "option" } });

        graph.renderGraph(nodesAndEdgesNo, 'no-container', '#F99', 1);
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
          // console.log("Current voter: ", currentVoter);
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
            console.error("Voter data timed out!. Voter: ", i+1);
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

        // Renders graphs
        const nodesAndEdges = nodes.concat(edges);
        renderYesGraph(nodesAndEdges);
        renderNoGraph(nodesAndEdges);

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

      /**
       * Vote for an option, currently only to ballot 0.
       * @param {*} voteValue
       */
      function vote(voteValue) {
        var option;
        console.log("voteValue", voteValue);
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