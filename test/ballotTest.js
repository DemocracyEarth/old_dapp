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

  it('should receive a vote and sucessfully increase appropiate vote count', function() {
    return Ballot.new(proposals).then(function(ballotInstance) {
      ballotInstance.receiveVote(0);
      ballotInstance.receiveVote(0);
      ballotInstance.receiveVote(0);
      return ballotInstance.getProposalVoteCount(0);
    }).then(function(returnedVoteCount){
      assert.equal(returnedVoteCount.toNumber(), 3, 'Number of votes does not match');
    });
  });

  it('should receive votes, compute winning proposal and output winner name', function () {
    return Ballot.new(proposals).then(function(ballotInstance) {
      ballotInstance.receiveVote(0);
      ballotInstance.receiveVote(1);
      ballotInstance.receiveVote(0);
      return ballotInstance.winnerName();
    }).then(function(winner) {
      assert.equal(web3.toUtf8(winner), 'yes', 'Returned winner name does not match expected');
    })
  });
});
