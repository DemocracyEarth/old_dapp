var Member = artifacts.require('Member');
var Ballot = artifacts.require('Ballot');

contract('Member', function(accounts) {
  var proposals = ['yes', 'no'];
  var ballot = null;
  var ballotAddress = null;

  it('should allow member to vote on a ballot proposal', function() {
    // create ballot, we'll need ballot address too
    return Ballot.new(proposals).then(function(ballotInstance) {
      ballot = ballotInstance;
      ballotAddress = ballotInstance.address;
      // create member
      return Member.new(accounts[0]);
    }).then(function(memberInstance) {
      // something like member.vote(ballotAddress, proposal int)
      memberInstance.vote(ballotAddress, 0);
      // check the ballot voteCount to confirm it increased
      return ballot.getProposalVoteCount(0);
    }).then(function(returnedVoteCount) {
      assert.equal(returnedVoteCount.toNumber(), 1, 'Number of votes in ballot did not increase after voting');
    });
  });
});