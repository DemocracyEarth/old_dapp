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
    
    mapping(address => Voter) votersData;

    function LiquidDemocracy() public {
        // For simplicity, ballot is always populated with only two option in this binary model
        for (uint i = 0; i < 1; i++) {
            ballot.push(BallotOption({
                voteCount: 0
            }));
        }
    }

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
    * @notice Getter for ballot option vote count
    * @param ballotOption The desired option to read vote count from
    */
    function getBallotVoteCount(uint ballotOption) public constant returns (uint voteCount) {
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
    }

    /**
    * @notice TODO
    * @param voter TODO
    * @param voteOption TODO
    */
    function vote(address voter, uint voteOption) public {
        // Cannot vote more than once and must be registered
        require(votersData[voter].registered == true);
        require(votersData[voter].voted != true);
        
        votersData[voter].voted = true;
        
        uint weight = votersData[voter].weight;

        // Record vote for specific options
        ballot[voteOption].voteCount += weight;
    }
}
