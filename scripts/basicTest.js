var Ballot = artifacts.require("./Ballot.sol");

module.exports = function(callback) {
  console.log('Executing basicTest script...')
  // Create ballot
  var ballotPromise = Ballot.new()

  ballotPromise.then(function(theBallot) {
    console.log('Ballot address: ', theBallot.address)
  })

  // Vote for one option more than once
  ballotPromise.then(function(theBallot) {
    return theBallot.vote(0)
  })

  // Show the winner 
  ballotPromise.then(function(theBallot) {
    return theBallot.winnerName()
  }).then(function(winner) {
    console.log('Winner: ', winner)
  })
}
