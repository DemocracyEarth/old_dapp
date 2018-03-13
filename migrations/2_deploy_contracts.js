//var Organization = artifacts.require("./Organization.sol");
var Delegation = artifacts.require("./Delegation.sol");
var HealthCareFund = artifacts.require("./HealthCareFund.sol");

module.exports = function(deployer) {
//  deployer.deploy(Organization);
  deployer.deploy(Delegation);
  deployer.deploy(HealthCareFund);
};