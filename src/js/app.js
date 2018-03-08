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
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function() {

        $.getJSON('Democracy.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract

            console.info("Loading json contract...: " + data);

            App.contracts.Democracy = TruffleContract(data);

            // Set the provider for our contract
            App.contracts.Democracy.setProvider(App.web3Provider);

            // Use our contract to retrieve and mark the adopted pets
            return;
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '#newVoter', App.addNewVoter);
        $(document).on('click', '#delegate', App.delegate);
        $(document).on('click', '.btn-adopt', App.handleAdopt);
    },

    delegate: function() {

        const from = document.getElementById('delegateFrom').value;
        const to = document.getElementById('delegateTo').value;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            App.contracts.Democracy.deployed().then(function(instance) {

                instance.getVoters.call().then(function(voters) {

                    console.log("Delegating from: " + voters[from]);
                    console.log("Delegating to: " + voters[to]);

                    instance.delegate.sendTransaction(voters[to], {from: voters[from], gas: 1000000}).then(function(result) {
                        console.log("Delegation successful");
                        console.log(result);
                        App.refreshGraph();
                    }).catch(function(err) {
                        console.log(err);
                    });

                });

            });

        });

    },

    refreshGraph: function() {

        App.contracts.Democracy.deployed().then(function(instance) {

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

                    cytoscape({
                        container: document.getElementById('cy'), // container to render in

                        elements: nodesAndEdges,

                        style: [ // the stylesheet for the graph
                            {
                                selector: 'node',
                                style: {
                                    'background-color': '#666',
                                    'label': 'data(id)'
                                }
                            },

                            {
                                selector: 'edge',
                                style: {
                                    'width': 3,
                                    'line-color': '#ccc',
                                    'target-arrow-color': '#ccc',
                                    'target-arrow-shape': 'triangle'
                                }
                            }
                        ],

                        layout: {
                            name: 'grid',
                            rows: 1
                        }

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

            App.contracts.Democracy.deployed().then(function(instance) {

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

    },

    handleAdopt: function(event) {

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            //      web3.eth.defaultAccount = account;

            var balance = web3.eth.getBalance(account, function(sth, bal) {
                console.log("balance: " + bal);
            });

            console.log("account: " + account);

            //       web3.version.getNetwork(function(err,res){console.log(res)})

            //       console.log("contracts: " + App.contracts.Democracy);

            App.contracts.Democracy.deployed().then(function(instance) {

                //       instance.getDelegated.call(account).then(function(a) {
                //                           console.log("representee: " + a);
                //                           console.log("representative: " + a);
                //                       }).catch(function(err) {
                //                            console.log(err);
                //                       });

                instance.getVoters.call().then(function(voters) {
                    console.log("voters: " + voters);
                    console.log(voters);

                    var delegations = new Object();
                    for (const voter of voters) {
                        console.log("processing voter: " + voter);
                        console.log("isAddress: " + web3.isAddress(voter));
                        instance.getDelegated.call(voter).then(function(representative) {
                            console.log("representee: " + voter);
                            console.log("representative: " + representative);
                            delegations[voter] = representative;
                        }).catch(function(err) {
                            console.log(err);
                        });
                    }
                    console.log("delegations: " + delegations);
                    console.log(delegations);
                });

                instance.exists.call(account).then(function(answer) {

                    console.log(answer);

                });
                //


                //         console.log("instance: " + instance);
                //         console.log(instance);
                //        console.log("account: " + account);
                //           instance.newVoter({from: account, gas: 1000000}).then(function(result) { // If we don't set the gas we get Out Of Gas Exception
                //                console.log("result: " + result);
                //                console.log(result);
                //
                //
                //                return;
                //             }).catch(function(err) {
                //                console.log(err.message);
                //            });
                //
                //            instance.exists.call(account).then(function(answer) {
                //
                //                                        console.log(answer);
                //
                //                                     });
                //
                //                         instance.getVoters.call().then(function(result) {
                //                              console.log("voters: " + result);
                //                              console.log(result);
                //                         });




            }).catch(function(err) {
                console.log(err.message);
            });
        });

    }

};

$(function() {
    $(window).load(function() {
        App.init();
    });
});