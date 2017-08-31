var Organization = artifacts.require("./Organization.sol");
var Member = artifacts.require("./Member.sol");

module.exports = function(callback) {
  var firstMember = null; // Organization creator
  var secondMember = null;
  var thirdMember = null;

  var accounts = web3.eth.accounts;

  var organization = null;

  // Instantiate members 
  Member.new(accounts[0]).then(function(firstMemInstance) {
    console.log('Instantiating three new members...');
    firstMember = firstMemInstance;
    return Member.new(accounts[1]);
  }).then(function(secondMemInstance) {
    secondMember = secondMemInstance;
    return Member.new(accounts[2])
  }).then(function(thirdMemInstance) {
    thirdMember = thirdMemInstance;
    // Create organization and set chairperson
    console.log('Instantiating new organization with first member as chairperson...');
    return Organization.new(accounts[0]);
  }).then(function(orgInstance) {
    organization = orgInstance;
    // Add the rest of members
    console.log('Adding rest of members to the organization...');
    orgInstance.addMember(accounts[1]);
    orgInstance.addMember(accounts[2]);
    // Check member addition, these should all log as true
    console.log('Checking members were successfully added...');
    orgInstance.members(accounts[0]).then(console.log);
    orgInstance.members(accounts[1]).then(console.log);
    orgInstance.members(accounts[2]).then(console.log);
  })
}
