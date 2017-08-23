var Organization = artifacts.require("./Organization.sol");
var Member = artifacts.require("./Member.sol");
var Ballot = artifacts.require('Ballot');

module.exports = function(callback) {
  // Initialize variables
  var firstMember = null; // Organization creator
  var secondMember = null;
  var ballot = null;
  var ballotAddress = null;
  var organization = null;
  var proposals = ['yes', 'no'];
  var accounts = web3.eth.accounts;

  // Instantiate members
  Member.new(accounts[0]).then(function(firstMemberInstance) {
    firstMember = firstMemberInstance;
    return Member.new(accounts[1]);
  }).then(function(secondMemberInstance) {
    secondMember = secondMemberInstance;
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
    organization.addMember(accounts[1]) // analogous to addMember(secondMember.address)
    // Then members vote on ballot
    firstMember.vote(ballotAddress, 0);
    secondMember.vote(ballotAddress, 0);
    // Then finally we check ballot
    return ballot.getProposalVoteCount(0);
  }).then(function(returnedVoteCount) {
    // There should be 2 votes for first proposal
    console.log(returnedVoteCount.toNumber());
  });
}
