var Ballot = artifacts.require("./Ballot.sol");

contract('Ballot', function(accounts) {
	it("should test populating voters mapping", function() {
    // Create proposals
    var proposals = ['yes', 'no']
    // Create voter accounts
    var chairperson = "0x27a82475ce932d7bf8d0de729f7dcedacad40b68";
    var account1 = "0xa9c8625357ae410c95a16a44bb9303f91d8eb3b1";
    var account2 = "0xedbcb60a70ac673e3b0966175916d1b86f81cd4e";
    
    return Ballot.new(proposals).then(function(ballotInstance) {
      ballotInstance.giveRightToVote(account1);
      ballotInstance.giveRightToVote(account2);
      ballotInstance.voters(chairperson).then(function(voterC) {
        console.log("Voter, chairperson: ", voterC)
      });
      ballotInstance.voters(account1).then(function(voter1) {
        console.log("Voter, account1: ", voter1)
      })
      ballotInstance.voters(account2).then(function(voter2) {
        console.log("Voter, account2: ", voter2)
      })
    })
  });
});