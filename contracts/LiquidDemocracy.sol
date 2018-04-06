pragma solidity ^0.4.4;

contract LiquidDemocracy {
    ////////////////
    // Data structures
    ////////////////

    // This is the type for a single option shown in a ballot
    struct Proposal {
        bytes32 name; // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    // This is the type for a single voter metadata
    struct Voter {
        uint weight;
        bool voted;
        // bool delegated;
        bool registered;
    }
    
    mapping(address => Voter) votersRegistration;

    // TODO - some kind of mapping for delegations 

    ////////////////
    // Constructor
    ////////////////
    function LiquidDemocracy(bytes32[] proposalNames) public {
    	// For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    ////////////////
    // Functions
    ////////////////

    // TODO - vote()
    // TODO - delegate()
    // TODO - revoke()
    
    /**
    * @notice Getter for voterRegistration
    * @param voter The voter to obtain
    */
    function getVoterRegistration(address voter) public view returns (uint, bool, bool) {
        return (votersRegistration[voter].weight, votersRegistration[voter].registered, votersRegistration[voter].voted);
    }
    
    /**
    * @notice Register a new voter setting initial Voter elements
    */
    function registerNewVoter() public {
        address VoterAddress = msg.sender;
        // Voters already registered cannot register again
        require(votersRegistration[VoterAddress].registered != true);

        votersRegistration[VoterAddress].weight = 1;
        votersRegistration[VoterAddress].registered = true;
    }
}
