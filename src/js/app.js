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
            console.info("Web3 instance defined by Metamask or related")
            App.web3Provider = web3.currentProvider;
        } else {
            console.info("Web3 instance not defined, connecting in read-only mode to the blockchain using an infura node")
            App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/KZSQapS5wjr4Iw7JhgtE'); // Using @aecc's key to connect to a Ropsten node
            document.getElementById('cy').innerHTML = "<h3 class='display-10 alert alert-danger'>Error: Metamask was not found!</h3> Read-only mode. Metamask is needed to write data to the blockchain."
            // Remove these comments if you wanna connect to ganache using your own private blockchain
            //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            //console.info("No web3 instance defined, using ganache")
        }

        try {
            web3 = new Web3(App.web3Provider);

            web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    console.log(error);
                }
                var account = accounts[0];
                web3.eth.defaultAccount = account;
            })

        } catch (e) {
//            console.error(e);
        }
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
        $(document).on('click', '#transfer-healthcare', App.transferHealthCare);
        $(document).on('click', '#yield-power', App.yieldPower);
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

                    instance.delegate.sendTransaction(voters[to], {gas: 1000000}).then(function(result) {
//                        console.log("Delegation successful");
//                        console.log(result);

                        instance.setNextExecutive({gas: 1000000}).then(function(result) {
//                            console.log("Setting new executive...");
                            App.refreshGraph();
                        });

                    }).catch(function(err) {
                        console.log(err);
                    });

                });

            });

        });

    },

    yieldPower: function() {
        App.contracts.Delegation.deployed().then(function(instance) {
            instance.yieldPower().then(function(result) {
                console.log(result);
                App.refreshGraph();
            }).catch(function(err) {
                console.log(err);
            });
        });
    },

    transferHealthCare: function() {
        App.contracts.Delegation.deployed().then(function(instance) {
            instance.transferTo(0xf25186b5081ff5ce73482ad761db0eb0d25abfbf).then(function(result) {
//                console.log(result);
                App.refreshGraph();
            }).catch(function(err) {
                console.log(err);
            });
        });
    },

    amIExecutive: function() {
        App.contracts.Delegation.deployed().then(function(instance) {
            instance.executive.call().then(function(executive) {
                var healthcareButton = document.getElementById('transfer-healthcare')
                var yieldPowerButton = document.getElementById('yield-power')
                if (web3.eth.defaultAccount == executive) {
                    healthcareButton.disabled = false;
                    yieldPowerButton.disabled = false;
                } else {
                    healthcareButton.disabled = true;
                    yieldPowerButton.disabled = true;
                }
            }).catch(function(err) {
                console.log(err);
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

                    instance.executive.call().then(function(executive) {
//                        console.log("Loading executive...");
                        document.getElementById('executive').textContent = executive;
                    });

                    instance.nextExecutive.call().then(function(executive) {
//                        console.log("Loading next executive...");
                        document.getElementById('next-executive').textContent = executive;
                    });

                }).catch(function(err) {
                    console.log(err);
                });

            });

            instance.getExecutiveBalance.call().then(function(balance) {
                document.getElementById('balance').value = balance;
            });

            App.amIExecutive();

        });
    },

    addNewVoter: function(event) {

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[App.nextVoter++];

            App.contracts.Delegation.deployed().then(function(instance) {

                instance.newVoter({from: account, gas: 1000000, value: 200}).then(function(result) { // If we don't set the gas we get Out Of Gas Exception
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