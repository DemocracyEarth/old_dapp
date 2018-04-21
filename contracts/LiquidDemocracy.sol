pragma solidity ^0.4.4;

contract LiquidDemocracy {

    // All the information about ballots is stored here
    struct BallotData {
        uint number;
        Ballot[] ballots;
    }

    // A ballot that shows options to choose
    struct Ballot {
        uint id;
        address ipfsBallotTitle;
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
        bool registered;
        address ipfsName;
        address ipfsEmail;
    }

    BallotData ballotData;

    mapping(address => address) delegations;

    mapping(address => Voter) votersData;

    function LiquidDemocracy() public {

    }
    
    /**
    * @notice Getter for votersData
    * @param voter The voter to obtain
    */
    function getVoterData(address voter) public view returns (uint, bool, bool) {
        return (votersData[voter].weight, votersData[voter].registered, votersData[voter].voted);
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
    function getBallotTitle(uint ballotId) public view returns (address ipfsTitle) {
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
    * @notice Gets the representative of the voter that calls this method
    */
    function getMyRepresentative() public view returns (address) {
        require(votersData[msg.sender].registered);
        return delegations[msg.sender];
    }

    /**
    * @notice Register a new voter
    */
    function registerNewVoter(address ipfsName, address ipfsEmail) external {
        registerNewVoter(msg.sender, ipfsName, ipfsEmail);
    }

    /**
    * @notice Create a new ballot
    */
    function createNewBallot(address ipfsTitle) external {
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
    * @notice Revoke the delegation and voting power already delegated
    */
    function revoke() external {
        revoke(msg.sender);
    }

    /**
    * @notice Perform a vote in the ballot
    * @param voteOption The integer option chosen by voter
    */
    function vote(uint ballotId, uint voteOption) external {
        vote(msg.sender, ballotId, voteOption);
    }

    /**
    * @notice Register a new voter setting initial Voter elements
    */
    function registerNewVoter(address voterAddress, address ipfsName, address ipfsEmail) private {
        // Voters already registered cannot register again
        require(!votersData[voterAddress].registered);

        votersData[voterAddress].ipfsName = ipfsName;
        votersData[voterAddress].ipfsEmail = ipfsEmail;
        votersData[voterAddress].weight = 1;
        votersData[voterAddress].registered = true;
        delegations[voterAddress] = voterAddress;
    }

    /**
    * @notice Create a new ballot
    */
    function createNewBallot(address from, address ipfsTitle) private {
        require(votersData[from].registered);

        Ballot memory ballot = Ballot(ballotData.number, ipfsTitle, BallotOption(0), BallotOption(0));
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
    * @notice Revoke the delegation and voting power already delegated
    * @param from revoke delegations on this voter
    */
    function revoke(address from) private {

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

        votersData[voter].voted = true;

        uint weight = votersData[voter].weight;
        if (voteOption == 1) {
            ballotData.ballots[ballotId].option1.voteCount += weight;
        } else {
            ballotData.ballots[ballotId].option2.voteCount += weight;
        }

    }
}
