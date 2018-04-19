pragma solidity ^0.4.4;

contract LiquidDemocracy {

    // This is the type for a single option shown in a ballot
    struct BallotOption {
        uint voteCount; // number of accumulated votes
    }
    
    BallotOption[] public ballot;

    // This is the type for a single voter metadata
    struct Voter {
        uint weight;
        bool voted;
        bool registered;
    }

    mapping(address => address) delegations;

    mapping(address => Voter) votersData;

    function LiquidDemocracy() public {
        // For simplicity, ballot is binary only
        for (uint i = 0; i < 2; i++) {
            ballot.push(BallotOption({
                voteCount: 0
            }));
        }
    }

    /**
    * @notice Revoke the delegation and voting power already delegated
    */
    function revoke() public {

        address representee = msg.sender;
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
    * @notice Getter for votersData
    * @param voter The voter to obtain
    */
    function getVoterData(address voter) public view returns (uint, bool, bool) {
        return (votersData[voter].weight, votersData[voter].registered, votersData[voter].voted);
    }

    /**
    * @notice Getter for ballot option vote count
    * @param ballotOption The desired option to read vote count from
    */
    function getBallotVoteCount(uint ballotOption) public view returns (uint voteCount) {
        return ballot[ballotOption].voteCount;
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
    function registerNewVoter() external {
        registerNewVoter(msg.sender);
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
    * @notice Perform a vote in the ballot
    * @param voteOption The integer option chosen by voter
    */
    function vote(uint voteOption) external {
        vote(msg.sender, voteOption);
    }

    /**
    * @notice Register a new voter setting initial Voter elements
    */
    function registerNewVoter(address voterAddress) private {
        // Voters already registered cannot register again
        require(!votersData[voterAddress].registered);

        votersData[voterAddress].weight = 1;
        votersData[voterAddress].registered = true;
        delegations[voterAddress] = voterAddress;
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
    * @notice Record a vote in the ballot
    * @param voter The address of the voter
    * @param voteOption The integer option chosen by voter
    */
    function vote(address voter, uint voteOption) private {
        // Cannot vote more than once and must be registered
        require(votersData[voter].registered);
        require(!votersData[voter].voted);

        votersData[voter].voted = true;

        uint weight = votersData[voter].weight;

        // Record vote for specific options
        ballot[voteOption].voteCount += weight;
    }
}
