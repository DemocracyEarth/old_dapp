//var Organization = artifacts.require("./Organization.sol");
var Delegation = artifacts.require("./Delegation.sol");

module.exports = function(deployer) {
//  deployer.deploy(Organization);
  deployer.deploy(Delegation);
};