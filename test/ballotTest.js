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
      // WIP
      // ballot = ballotInstance;
      // ballotInstance.receiveVote(0);
      // try doing a receiveVote() and then use a getter to 
      // read the voteCount value
      return ballotInstance.proposals(0);
    }).then(function(returnedResult){
      console.log(returnedResult);
    });
  });

});