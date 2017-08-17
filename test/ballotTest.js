var Ballot = artifacts.require('Ballot');

contract('Ballot', function(accounts) {
  var proposals = ['yes', 'no'];
  it('should create a Ballot instance with provided proposals', function() {
    return Ballot.new(proposals).then(function(ballotInstance) {
      return ballotInstance.getProposalsLength();
    }).then(function(returnedProposal) {
      assert.equal(returnedProposal.toNumber(), 2, 'Length of proposals array is wrong');
    });
  });

});