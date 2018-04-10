var Delegation = artifacts.require("./Delegation.sol");

module.exports = function(deployer) {
  deployer.deploy(Delegation);
};