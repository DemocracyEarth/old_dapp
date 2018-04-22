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
    nodesAndEdgesYes.push({ group: "nodes", data: { id: 0, name:"yes", type: "option" }});
    // populating dummy data
    for (let i = 2; i < 6; i++) {
      let voterName = "Voter " + i;
      nodesAndEdgesYes.push({ group: "nodes", data: { id: i, name: voterName, type: "voter" }});
    }

    for (let j = 2; j < 4; j++) {
          const id = j + 100
          nodesAndEdgesYes.push({ group: "edges", data: { id: id, source: 0, target: j }});
    }
    for (let j = 4; j < 6; j++) {
      const id = j + 100
      let k = j-2
      nodesAndEdgesYes.push({ group: "edges", data: { id: id, source: k, target: j }});
    }
    let cy = cytoscape({
      container: document.getElementsByClassName('yes-container'), // container to render in

      elements: nodesAndEdgesYes,

      style: [ // the stylesheet for the graph
          {
            selector: 'node',
            style: {
                'background-color': ' #9F9',
                'label': 'data(name)',
                  'font-size' : 24,
                  // 'text-valign': 'bottom',
                  'text-opacity': '0.4',
                  'text-rotation': '0.2',
                  'text-margin-y': '10px'
              }
          },
          {
            selector: '.option',
            style: {
              'font-size' : 32,
              'text-valign': 'top',
              'text-opacity': '0.9',
              shape: "hexagon",
            }
          },
          {
              selector: 'edge',
              style: {
                  'curve-style': 'bezier',
                  'width': 4,
                  'line-color': '#666',
                  'source-arrow-color': '#000',
                  'source-arrow-shape': 'triangle'
              }
          }
      ],

      layout: {
        name: "breadthfirst",
        directed:true,
        animate: true,
        roots:0


      }

    });
  

    cy.ready(function() {

      // cy.filter("node[id = '0']").addClass("yes-vote-cast-div");
      // cy.filter("node[id = '1']").addClass("no-vote-cast-div")


      var opt = cy.filter("node[type = 'option']");

      

      for (var i = 0; i < opt.length; i++) {
        opt[i].addClass("option");
      }

      // cy.zoom(0.5);
      // cy.center();
    });

    var nodesAndEdgesNo = [];
    nodesAndEdgesNo.push({ group: "nodes", data: { id: 1, name:"no", type: "option" }});
    // populating dummy data
    for (let i = 9; i < 19; i++) {
      let voterName = "Voter " + i;
      nodesAndEdgesNo.push({ group: "nodes", data: { id: i, name: voterName, type: "voter" }});
    }

    for (let j = 9; j < 12; j++) {
          const id = j + 100
          let k = 1
          nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: k, target: j }});
    }
    for (let j = 12; j < 17; j++) {
      const id = j + 100
      let k = j-2
      nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: k, target: j }});
    }
    for (let j = 17; j < 19; j++) {
      const id = j + 100
      let k = 16
      nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: k, target: j }});
    }
    let cn = cytoscape({
      container: document.getElementsByClassName('no-container'), // container to render in

      elements: nodesAndEdgesNo,

      style: [ // the stylesheet for the graph
          {
            selector: 'node',
            style: {
                'background-color': ' #F99',
                'label': 'data(name)',
                  'font-size' : 24,
                  // 'text-valign': 'bottom',
                  'text-opacity': '0.4',
                  'text-rotation': '0.2',
                  'text-margin-y': '10px'
              }
          },
          {
            selector: '.option',
            style: {
              'font-size' : 32,
              'text-valign': 'top',
              'text-opacity': '0.9',
              shape: "hexagon",
            }
          },
          {
              selector: 'edge',
              style: {
                  'curve-style': 'bezier',
                  'width': 4,
                  'line-color': '#666',
                  'source-arrow-color': '#000',
                  'source-arrow-shape': 'triangle'
              }
          }
      ],

      layout: {
        name: "breadthfirst",
        directed:true,
        roots:1
      }

    });
  

    cn.ready(function() {

      // cn.filter("node[id = '1']").addClass("no-vote-cast-div")


      var opt = cn.filter("node[type = 'option']");

      

      for (var i = 0; i < opt.length; i++) {
        opt[i].addClass("option");
      }

      // cn.zoom(0.5);
      // cn.center();
    });




    function back(){
      $location.path('/ballots')
    }
  }]);

      // Graph for no-container

    // TODO: dummy data atm
    // var nodesAndEdgesNo = [];
    //   for (let i = 0; i < 2; i++) {
    //       nodesAndEdgesNo.push({ group: "nodes", data: { id: i }});
    //   }

    //    for (let i = 0; i < 1; i++) {
    //         const id = Math.random();
    //         nodesAndEdgesNo.push({ group: "edges", data: { id: id, source: 0, target: 1 }});
    //     }

    // var cn = cntoscape({
    //     container: document.getElementById('no-container'), // container to render in

    //     elements: nodesAndEdgesNo,

    //     style: [ // the stylesheet for the graph
    //         {
    //             selector: 'node',
    //             style: {
    //                 'background-color': '#F66',
    //                 'label': 'data(id)',
    //                 'font-size' : 20,
    //                 'text-valign': 'bottom',
    //                 'text-opacity': '0.2',
    //                 'text-rotation': '0.2',
    //                 'text-margin-y': '10px'
    //             }
    //         },

    //         {
    //             selector: 'edge',
    //             style: {
    //                 'curve-style': 'bezier',
    //                 'width': 2,
    //                 'line-color': '#666',
    //                 'target-arrow-color': '#000',
    //                 'target-arrow-shape': 'triangle'
    //             }
    //         }
    //     ],

    //     layout: {
    //         name: 'circle'
    //     }

    // });

    // cn.zoom(0.5);
    // cn.center();


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