App = {
    web3Provider: null,
    contracts: {},
    nextVoter: 0,
    init: function() {
        var web3 = App.initWeb3();
        return web3;
    },

    initWeb3: function() {

        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            console.info("Web3 instance defined")
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            console.info("No web3 instance defined, using ganache")
        }
        var web3 = new Web3(App.web3Provider);

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0]; // TODO: shoudn't be the default
            web3.eth.defaultAccount = account;
        })

        return App.initContract();
    },

    initContract: function() {

        $.getJSON('Delegation.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            console.info("Loading json contract...: " + data);

            App.contracts.Delegation = TruffleContract(data);

            // Set the provider for our contract
            App.contracts.Delegation.setProvider(App.web3Provider);

            App.refreshGraph();
            return;
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '#newVoter', App.addNewVoter);
        $(document).on('click', '#delegate', App.delegate);
        $(document).on('click', '#refreshGraph', App.refreshGraph);
    },

    delegate: function() {

        const from = document.getElementById('delegateFrom').value;
        const to = document.getElementById('delegateTo').value;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.contracts.Delegation.deployed().then(function(instance) {

                instance.getVoters.call().then(function(voters) {

//                    console.log("Delegating from: " + voters[from]);
//                    console.log("Delegating to: " + voters[to]);

                    instance.delegate.sendTransaction(voters[to], {from: voters[from], gas: 1000000}).then(function(result) {
//                        console.log("Delegation successful");
//                        console.log(result);
                        App.refreshGraph();
                    }).catch(function(err) {
                        console.log(err);
                    });

                });

            });

        });

    },

    refreshGraph: function() {

        App.contracts.Delegation.deployed().then(function(instance) {

            instance.getVoters.call().then(function(voters) {

//                console.log("voters:");
//                console.log(voters);

                var nodesAndEdges = [];
                for (let i = 0; i < voters.length; i++) {
                    nodesAndEdges.push({ group: "nodes", data: { id: voters[i] }});
                }

                instance.getRepresentatives.call().then(function(representatives) {

//                    console.log("representatives:");
//                    console.log(voters);

                    for (let i = 0; i < voters.length; i++) {
//                        const id = voters[i] + "-" + representatives[i]; // TODO: real edge name
                        const id = Math.random();
                        nodesAndEdges.push({ group: "edges", data: { id: id, source: voters[i], target: representatives[i] }});
                    }

                    var cy = cytoscape({
                        container: document.getElementById('cy'), // container to render in

                        elements: nodesAndEdges,

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

                    instance.setNextExecutive({gas: 1000000}).then(function(result) {
                        instance.nextExecutive.call().then(function(executive) {
//                            console.log("Setting new executive...");
                            document.getElementById('executive').textContent = executive;
                        });
                    });

                }).catch(function(err) {
                    console.log(err);
                });

            });


        });
    },

    addNewVoter: function(event) {

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[App.nextVoter++];

            App.contracts.Delegation.deployed().then(function(instance) {

                instance.newVoter({from: account, gas: 1000000}).then(function(result) { // If we don't set the gas we get Out Of Gas Exception
//                    console.log("result: " + result);
//                    console.log(result);
                    console.log("Voter added successfully");
                    console.log(result);
                    App.refreshGraph();
                }).catch(function(err) {
                    console.log(err.message);
                });

            });

        });

    }

};

$(function() {
    $(window).load(function() {
        App.init();
    });
});