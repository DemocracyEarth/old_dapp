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

  it('should receive a vote and sucessfully increse appropiate vote count', function() {
    var ballot = null;
    return Ballot.new(proposals).then(function(ballotInstance) {
      ballotInstance.receiveVote(0);
      ballotInstance.receiveVote(0);
      ballotInstance.receiveVote(0);
      return ballotInstance.getProposalVoteCount(0);
    }).then(function(returnedVoteCount){
      assert.equal(returnedVoteCount.toNumber(), 3, 'Number of votes does not match');
    });
  });

});