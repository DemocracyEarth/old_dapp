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
        // TODO: Using @aecc's key to connect to a Ropsten node, change to our own node
        web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/KZSQapS5wjr4Iw7JhgtE');
    }

    function setEthDefaultAccount() {
      return new Promise((resolve, reject) => {
        try {
          const web3 = new Web3(web3Provider);
          web3.eth.getAccounts(function(error, accounts) {
            if (error) {
              reject(error);
            }
            const account = accounts[0];
            web3.eth.defaultAccount = account;
            resolve(web3.eth.defaultAccount);
          });
        } catch (e) {
          reject(e);
        }
      });
    }

 
    // Contract loading
    const loadContract = async () => {
      const contractData = await $http.get('contracts/LiquidDemocracy.json');
      console.info("Loading json contract...: ", contractData);
      contract = TruffleContract(contractData.data);

      // Set the provider for our contract
      contract.setProvider(web3Provider);
      const account = await setEthDefaultAccount();
      console.log("account", account);
      return contract;
    }

    const checkInstance = async (contract) => {
      return await contract.deployed();
    }
    return {
      loadContract: loadContract,
      checkInstance: checkInstance,
      contract: contract,
      instance: instance
    }
  }]);
})();
