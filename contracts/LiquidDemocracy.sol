pragma solidity 0.4.23;


contract LiquidDemocracy {

    // All the information about ballots is stored here
    struct BallotData {
        uint number;
        Ballot[] ballots;
    }

    // A ballot that shows options to choose
    struct Ballot {
        address owner;
        uint id;
        bytes32 ipfsBallotTitle;
        BallotOption option1;
        BallotOption option2;
    }

    // This is the type for a single option shown in a ballot
    struct BallotOption {
        uint voteCount; // number of accumulated votes
    }

    // This is the type for a single voter metadata
    struct Voter {
        uint weight;
        bool voted;
        bool votedOption1;
        bool votedOption2;
        bool registered;
        bytes32 ipfsHash;
        address representative;
    }

    address[] public voters;

    BallotData ballotData;

    mapping(address => address) delegations;

    mapping(address => Voter) public votersData;

    /**
    * @notice gets the addresses of the voters
    */
    function getVoters() public view returns (address[]) {
        return voters;
    }

    /**
    * @notice Gets number of voters registered
    */
    function getVotersCount() public view returns (uint) {
        return voters.length;
    }

    /**
    * @notice Gets number of ballots created
    */
    function getBallotCount() public view returns (uint) {
        return ballotData.number;
    }
    
    /**
    * @notice Getter for votersData
    * @param voter The voter to obtain
    */
    function getVoterData(address voter) public view returns (uint, bool, bool, bytes32, address, bool, bool) {
        return (votersData[voter].weight, votersData[voter].registered, votersData[voter].voted,
            votersData[voter].ipfsHash, votersData[voter].representative,
            votersData[voter].votedOption1, votersData[voter].votedOption2);
    }

    /**
    * @notice Getter for ballot option vote count for option 1
    * @param ballotId The desired option to read vote count from
    */
    function getBallotVoteOption1Count(uint ballotId) public view returns (uint votes) {
        return ballotData.ballots[ballotId].option1.voteCount;
    }

    /**
    * @notice Getter for ballot option vote count for option 2
    * @param ballotId The desired option to read vote count from
    */
    function getBallotVoteOption2Count(uint ballotId) public view returns (uint votes) {
        return ballotData.ballots[ballotId].option2.voteCount;
    }

    /**
    * @notice Getter for ballot title
    * @param ballotId The desired option to read vote count from
    */
    function getBallotTitle(uint ballotId) public view returns (bytes32 ipfsTitle) {
        return ballotData.ballots[ballotId].ipfsBallotTitle;
    }

    /**
    * @notice Gets the weight of the voter that calls this method
    */
    function getMyWeight() public view returns (uint) {
        require(votersData[msg.sender].registered);
        return votersData[msg.sender].weight;
    }

    /**
    * @notice Gets voter's data
    */
    function getMyData() public view returns (uint, bool, bool, bytes32, address, bool, bool) {
      return getVoterData(msg.sender);
    }

    /**
    * @notice Gets the representative of the voter that calls this method
    */
    function getMyRepresentative() public view returns (address) {
        return getRepresentative(msg.sender);
    }

    /**
    * @notice Gets ballots
    */
    function getLastBallot() public view returns (bytes32, address) {
        return (
            ballotData.ballots[ballotData.number - 1].ipfsBallotTitle,
            ballotData.ballots[ballotData.number - 1].owner
        );
    }

    /**
    * @notice Gets the representative of the given voter
    */
    function getRepresentative(address voter) public view returns (address) {
        require(votersData[voter].registered);
        return delegations[voter];
    }

    /**
    * @notice Register a new voter
    */
    function registerNewVoter(bytes32 ipfsHash) external {
        registerNewVoter(msg.sender, ipfsHash);
    }

    /**
    * @notice Reset voter registered flag
    */
    function resetVoter() external {
        resetVoter(msg.sender);
    }

    /**
    * @notice Create a new ballot
    */
    function createNewBallot(bytes32 ipfsTitle) external {
        createNewBallot(msg.sender, ipfsTitle);
    }

    /**
     * @notice Delegate the voting power of a voter to another voter
     * Only the person calling this function has the power of delegating his/her vote
     * @param representative voter to delegate the voting power to
     */
    function delegate(address representative) external {
        delegate(msg.sender, representative);
    }

    /**
    * @notice Remove the delegation and voting power already delegated
    */
    function removeDelegation() external {
        removeDelegation(msg.sender);
    }

    /**
    * @notice Perform a vote in the ballot
    * @param voteOption The integer option chosen by voter
    */
    function vote(uint ballotId, uint voteOption) external {
        vote(msg.sender, ballotId, voteOption);
    }

    /**
    * @notice Removes the vote given
    */
    function removeVote() external {
      removeVote(msg.sender);
    }

    /**
    * @notice Register a new voter setting initial Voter elements
    */
    function registerNewVoter(address voterAddress, bytes32 ipfsHash) private {
        // Voters already registered cannot register again
        require(!votersData[voterAddress].registered);

        votersData[voterAddress].ipfsHash = ipfsHash;
        votersData[voterAddress].weight = 1;
        votersData[voterAddress].registered = true;
        votersData[voterAddress].representative = voterAddress;
        votersData[voterAddress].voted = false;
        votersData[voterAddress].votedOption1 = false;
        votersData[voterAddress].votedOption2 = false;
        delegations[voterAddress] = voterAddress;
        voters.push(voterAddress);
    }

    /**
    * @notice Reset registered value for development purposes
    */
    function resetVoter(address voterAddress) private {
        require(votersData[voterAddress].registered);

        votersData[voterAddress].registered = false;
    }

    /**
    * @notice Create a new ballot
    */
    function createNewBallot(address from, bytes32 ipfsTitle) private {
        require(votersData[from].registered);
        Ballot memory ballot = Ballot(from, ballotData.number, ipfsTitle, BallotOption(0), BallotOption(0));
        ballotData.ballots.push(ballot);
        ballotData.number += 1;
    }

    /**
     * @notice Delegate the voting power of a voter to another voter
     * @param from voter from which to delegate voting power
     * @param representative voter to delegate the voting power to
     */
    function delegate(address from, address representative) private {

        address representee = from;
        require(delegations[representee] == representee); // At the moment you can apply a delegation once
        require(votersData[representee].registered);
        require(votersData[representative].registered);

        delegations[representee] = representative; // Delegate my own vote
        votersData[representee].representative = representative;

        // Remove votes if they exist. NOTE: this doesn't yet update total number of votes
        if (votersData[representee].voted) {
          votersData[representee].voted = false;
          votersData[representee].votedOption1 = false;
          votersData[representee].votedOption2 = false;
        }

        address nextRepresentative = representative;

        // While there is voter that hasn't performed a delegation to another voter
        // transitively add weight from their voting power
        while (delegations[nextRepresentative] != nextRepresentative) {
            votersData[nextRepresentative].weight += votersData[representee].weight;
            nextRepresentative = delegations[nextRepresentative];
        }

        votersData[nextRepresentative].weight += votersData[representee].weight;

    }

    /**
    * @notice Remove the delegation and voting power already delegated
    * @param from remove delegations on this voter
    */
    function removeDelegation(address from) private {

        address representee = from;
        require(votersData[representee].registered);
        require(delegations[representee] != representee); // You must have a delegation already

        address nextRepresentative = delegations[representee];

        // While there is voter that hasn't performed a delegation to another voter
        // transitively remove weight from their voting power
        while (delegations[nextRepresentative] != nextRepresentative) {
            votersData[nextRepresentative].weight -= votersData[representee].weight;
            nextRepresentative = delegations[nextRepresentative];
        }
        votersData[nextRepresentative].weight -= votersData[representee].weight;
        delegations[representee] = representee;
        votersData[representee].representative = representee;

    }

    /**
    * @notice Record a vote in the ballot
    * @param voter The address of the voter
    * @param voteOption The integer option chosen by voter
    */
    function vote(address voter, uint ballotId, uint voteOption) private {
        // Cannot vote more than once and must be registered
        require(votersData[voter].registered);
        require(!votersData[voter].voted);
        require(delegations[voter] == voter); // Cannot vote if it has a representative

        votersData[voter].voted = true;

        uint weight = votersData[voter].weight;
        if (voteOption == 1) {
            votersData[voter].votedOption1 = true;
            ballotData.ballots[ballotId].option1.voteCount += weight;
        } else {
            votersData[voter].votedOption2 = true;
            ballotData.ballots[ballotId].option2.voteCount += weight;
        }

    }

    /**
    * @notice Removes the vote given
    * @param voter The address of the voter
    */
    function removeVote(address voter) private {

      require(votersData[voter].voted);

      if (votersData[voter].votedOption1) {
        ballotData.ballots[0].option1.voteCount -= votersData[voter].weight;
      } else {
        ballotData.ballots[0].option2.voteCount -= votersData[voter].weight;
      }

      votersData[voter].voted = false;
      votersData[voter].votedOption1 = false;
      votersData[voter].votedOption2 = false;

    }
}
