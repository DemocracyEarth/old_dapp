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

    // TODO - revoke()
    
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
    * @notice Register a new voter setting initial Voter elements
    */
    function registerNewVoter() public {
        address voterAddress = msg.sender;
        // Voters already registered cannot register again
        require(votersData[voterAddress].registered != true);

        votersData[voterAddress].weight = 1;
        votersData[voterAddress].registered = true;
        delegations[voterAddress] = voterAddress;
    }

    // Delegations

    /**
     * @notice Delegate the voting power of a voter to another voter
     * Only the person calling this function has the power of delegating his/her vote
     * @param representative voter to delegate the voting power to
     */
    function delegate(address representative) public {

        address representee = msg.sender;
        require(delegations[representee] == representee); // At the moment you can apply a delegation once
        require(votersData[representee].registered);
        require(votersData[representative].registered);

        delegations[representee] = representative; // Delegate my own vote

        address nextRepresentative = representative;
        address nextRepresentee = representee;

        // While there is voter that hasn't performed a delegation to another voter
        // transitively add votes
        while (delegations[nextRepresentative] != nextRepresentative) {

            votersData[nextRepresentative].weight += votersData[nextRepresentee].weight;
            votersData[nextRepresentee].weight -= votersData[nextRepresentee].weight;

            nextRepresentee = nextRepresentative;
            nextRepresentative = delegations[nextRepresentative];

        }

        votersData[nextRepresentative].weight += votersData[nextRepresentee].weight;
        votersData[nextRepresentee].weight -= votersData[nextRepresentee].weight;

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
    * @notice Record a vote in the ballot
    * @param voter The address of the voter
    * @param voteOption The integer option chosen by voter
    */
    function vote(address voter, uint voteOption) public {
        // Cannot vote more than once and must be registered
        require(votersData[voter].registered);
        require(!votersData[voter].voted);

        votersData[voter].voted = true;

        uint weight = votersData[voter].weight;

        // Record vote for specific options
        ballot[voteOption].voteCount += weight;
    }
}
