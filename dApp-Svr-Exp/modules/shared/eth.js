(function () {
  'use strict';
  angular.module('dAppSvrApp').factory('apiETH', ['$http',
	function($http) {
    let contract;
    let instance;
    let web3Provider;

    // WEB 3 initialization
    if (typeof web3 !== 'undefined') {
        console.info("Web3 instance defined by Metamask or related")
        web3Provider = web3.currentProvider;
    } else {
        console.info("Web3 instance not defined, connecting in read-only mode to the blockchain using an infura node")
        web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/KZSQapS5wjr4Iw7JhgtE'); // TODO: Using @aecc's key to connect to a Ropsten node, change to our own node
    }

    function getEthAccounts() {
      return new Promise((resolve, reject) => {
        try {
          const web3 = new Web3(web3Provider);
          web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                reject(error);
            }
            var account = accounts[0];
            web3.eth.defaultAccount = account;
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    }
    
    // Contract loading
    function loadContract() {
      return new Promise((resolve, reject) => {
        $http.get('contracts/LiquidDemocracy.json').then(function(data){
          // Get the necessary contract artifact file and instantiate it with truffle-contract
          console.info("Loading json contract...: " + data);
    
          contract = TruffleContract(data.data);
    
          // Set the provider for our contract
          contract.setProvider(web3Provider);
          resolve(contract);
    
        }, function(err){
          reject(err);
        });
      });
    };

    function checkInstance(contract) {
      return new Promise((resolve, reject) => {
        // Simple API call to the contract
        contract.deployed().then(function(instance) {
          resolve(instance);
        });
      }, function(err){
        reject(err);
      });
    }
    return {
      loadContract: loadContract,
      checkInstance: checkInstance,
      contract: contract,
      instance: instance
    }
  }]);
})();
