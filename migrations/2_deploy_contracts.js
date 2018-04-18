var LiquidDemocracy = artifacts.require("./LiquidDemocracy.sol");

module.exports = function(deployer) {
  deployer.deploy(LiquidDemocracy);
};