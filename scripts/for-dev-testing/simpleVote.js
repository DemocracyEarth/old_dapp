var Member = artifacts.require("./Member.sol");
var Ballot = artifacts.require('Ballot');

module.exports = function(callback) {
    // Initialize variables
    var alice = null;
    var bob = null;
    var charlie = null;
    var ballot = null;
    var ballotAddress = null;
    var proposals = ['yes, let us be 100% opensource', 'no, opensource is toxic'];
    var accounts = web3.eth.accounts;
  
    // Instantiate individuals
    Member.new(accounts[0]).then(function(aliceInstance) {
      console.log('Instantiating three new individuals...');
      alice = aliceInstance;
      return Member.new(accounts[1]);
    }).then(function(bobInstance) {
      bob = bobInstance;
      return Member.new(accounts[2]);
    }).then(function(charlieInstance) {
      charlie = charlieInstance;
      // Then ballot
      console.log('Creating a new ballot with the following proposals: ', proposals);
      return Ballot.new(proposals);
    }).then(function(ballotInstance) {
      ballot = ballotInstance;
      ballotAddress = ballotInstance.address;
    }).then(function() {
      // Then individuals vote on ballot
      console.log('individuals now voting on ballot proposals...');
      alice.vote(ballotAddress, 0);
      bob.vote(ballotAddress, 0);
      charlie.vote(ballotAddress, 1);
      // Then finally we check ballot
      return ballot.winnerName();
    }).then(function(winner) {
      // There should be 2 votes for first proposal, 1 for the second
      console.log('The winning proposal is: ', web3.toUtf8(winner));
    });
  }