var Ballot = artifacts.require("./Ballot.sol");

contract('Ballot', function(accounts) {
	it("should create a new ballot with given proposals and test voting", function() {
    // Create proposals
    var proposals = ['yes', 'no']
    return Ballot.new(proposals).then(function(ballotInstance) {
      ballotInstance.vote(0);
      return ballotInstance.winnerName();
    }).then(function(winnerName) {
      console.log('Winner: ', winnerName);
    })
  });
});