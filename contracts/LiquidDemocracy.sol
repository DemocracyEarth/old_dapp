pragma solidity ^0.4.4;

contract LiquidDemocracy {

    // This is the type for a single option shown in a ballot
    struct BallotOption {
        bytes32 name; // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }
    
    // Array is always populated with binary, yes/no, options for simplicity
    BallotOption[] public ballot;

    // This is the type for a single voter metadata
    struct Voter {
        uint weight;
        bool voted;
        bool registered;
    }
    
    mapping(address => Voter) votersData;

    // TODO - some kind of mapping for delegations 

    function LiquidDemocracy(bytes32[] ballotInstance) public {
        for (uint i = 0; i < ballotInstance.length; i++) {
            ballot.push(BallotOption({
                name: ballotInstance[i],
                voteCount: 0
            }));
        }
    }

    // TODO - vote()
    // TODO - delegate()
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
    }
}
