(function () {
  'use strict';
  angular.module('dAppSvrApp').controller('BallotDetailCtrl',
    ['$http', '$log', '$mdDialog', '$routeParams', '$location', '$mdToast', '$scope',
    function BallotDetailCtrl($http, $log, $mdDialog, $routeParams, $location, $mdToast, $scope) {
      var vm = this;

      vm.back = back;
      vm.vote = vote;
      vm.delegate = delegate;
      vm.revokeVote = revokeVote;
      vm.revokeDelegation = revokeDelegation;

      vm.ballotId = $routeParams.id;
      vm.ballot = JSON.parse(localStorage.getItem('ballot'));

      function revokeVote() {
        console.log("revoke vote");
        // Call ETH revoke vote
      }

      function revokeDelegation() {
        console.log("revoke delegation");
        // Call ETH revoke delegation
      }

      // Graph for yes-container

    // TODO: dummy data atm
    var nodesAndEdgesYes = [];
      for (let i = 0; i < 2; i++) {
          nodesAndEdgesYes.push({ group: "nodes", data: { id: i }});
      }

       for (let i = 0; i < 1; i++) {
            const id = Math.random();
            nodesAndEdgesYes.push({ group: "edges", data: { id: id, source: 0, target: 1 }});
        }

    var cy = cytoscape({
        container: document.getElementById('yes-container'), // container to render in

        elements: nodesAndEdgesYes,

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#F66',
                    'label': 'data(id)',
                    'font-size' : 20,
                    'text-valign': 'bottom',
                    'text-opacity': '0.2',
                    'text-rotation': '0.2',
                    'text-margin-y': '10px'
                }
            },

            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'width': 2,
                    'line-color': '#666',
                    'target-arrow-color': '#000',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],

        layout: {
            name: 'circle'
        }

    });

    cy.zoom(0.5);
    cy.center();


      // Graph for no-container

    // TODO: dummy data atm
    var nodesAndEdgesNo = [];
      for (let i = 0; i < 2; i++) {
          nodesAndEdgesNo.push({ group: "nodes", data: { id: i }});
      }

       for (let i = 0; i < 1; i++) {
            const id = Math.random();
            nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: 0, target: 1 }});
        }

    var cn = cytoscape({
        container: document.getElementById('no-container'), // container to render in

        elements: nodesAndEdgesNo,

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#F66',
                    'label': 'data(id)',
                    'font-size' : 20,
                    'text-valign': 'bottom',
                    'text-opacity': '0.2',
                    'text-rotation': '0.2',
                    'text-margin-y': '10px'
                }
            },

            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'width': 2,
                    'line-color': '#666',
                    'target-arrow-color': '#000',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],

        layout: {
            name: 'circle'
        }

    });

    cn.zoom(0.5);
    cn.center();


      $scope.users = [
        {
          name: 'Virgile',
          id: 'v123456'
        },
        {
          name: 'Alex',
          id: 'a123456'
        },
        {
          name: 'Alessandro',
          id: 'a654321'
        },
        {
          name: 'Lucas',
          id: 'l654321'
        }
      ];
      function back(){
        $location.path('/ballots')
      }
      function vote(voteValue) {
        // call ETH vote
        console.log(voteValue);
      }
      function delegate(delegateValue) {
        // call ETH delegate
        console.log(delegateValue);
      }
    }]);
})(); 