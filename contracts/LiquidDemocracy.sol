pragma solidity ^0.4.4;

contract LiquidDemocracy {

    // This is the type for a single option shown in a ballot
    struct Proposal {
        bytes32 name; // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }
    
    // Keep array populated with binary, yes/no, options for simplicity
    Proposal[] public proposals;

    // This is the type for a single voter metadata
    struct Voter {
        uint weight;
        bool voted;
        bool registered;
    }

    mapping(address => address) delegations;
    
    mapping(address => Voter) votersData;

    // TODO - some kind of mapping for delegations 

    function LiquidDemocracy(bytes32[] proposalNames) public {
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // TODO - vote()
    // TODO - revoke()
    
    /**
    * @notice Getter for votersData
    * @param voter The voter to obtain
    */
    function getVoterData(address voter) public view returns (uint, bool, bool) {
        return (votersData[voter].weight, votersData[voter].registered, votersData[voter].voted);
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
     * Delegate the voting power of a voter to another voter
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
    * Gets the weight of the voter that calls this method
    */
    function getMyWeight() public view returns (uint) {
        require(votersData[msg.sender].registered);
        return votersData[msg.sender].weight;
    }

    /**
    * Gets the representative of the voter that calls this method
    */
    function getMyRepresentative() public view returns (address) {
        require(votersData[msg.sender].registered);
        return delegations[msg.sender];
    }
}
