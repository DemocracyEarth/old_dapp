//var Organization = artifacts.require("./Organization.sol");
var Democracy = artifacts.require("./Democracy.sol");

module.exports = function(deployer) {
//  deployer.deploy(Organization);
  deployer.deploy(Democracy);
};