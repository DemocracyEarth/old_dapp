var Organization = artifacts.require("./Organization.sol");
var Member = artifacts.require("./Member.sol");
var Ballot = artifacts.require('Ballot');

module.exports = function(callback) {
  // Initialize variables
  var firstMember = null; // Organization creator
  var secondMember = null;
  var thirdMember = null;
  var ballot = null;
  var ballotAddress = null;
  var organization = null;
  var proposals = ['yes, let us be 100% opensource', 'no, opensource is toxic'];
  var accounts = web3.eth.accounts;

  // Instantiate members
  Member.new(accounts[0]).then(function(firstMemberInstance) {
    firstMember = firstMemberInstance;
    return Member.new(accounts[1]);
  }).then(function(secondMemberInstance) {
    secondMember = secondMemberInstance;
    return Member.new(accounts[2]);
  }).then(function(thirdMemberInstance) {
    thirdMember = thirdMemberInstance;
    // Then organization
    return Organization.new(accounts[0]);
  }).then(function(orgInstance) {
    organization = orgInstance;
    // Then ballot
    return Ballot.new(proposals);
  }).then(function(ballotInstance) {
    ballot = ballotInstance;
    ballotAddress = ballotInstance.address;
  }).then(function() {
    // Next add members to org
    organization.addMember(accounts[1]); // analogous to addMember(secondMember.address)
    organization.addMember(accounts[2]);
    // Then members vote on ballot
    firstMember.vote(ballotAddress, 0);
    secondMember.vote(ballotAddress, 0);
    thirdMember.vote(ballotAddress, 1);
    // Then finally we check ballot
    return ballot.winnerName();
  }).then(function(winner) {
    // There should be 2 votes for first proposal, 1 for the second
    console.log('The winning proposal is: ', web3.toUtf8(winner));
  });
}
