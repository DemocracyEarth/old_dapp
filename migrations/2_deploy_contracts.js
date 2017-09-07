var Organization = artifacts.require("./Organization.sol");
var VoteToken = artifacts.require("./VoteToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Organization);
  deployer.deploy(VoteToken);
};
