pragma solidity ^0.4.4;

/*
A Ballot presents options for voters to participate in regarding a specific Issue

The building blocks for a ballot are: 
- Interface
- Options
- Criteria
*/

contract Ballot {
	// This is the type for a single option shown in a ballot
	struct Option {
        bytes32 optionName;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    // Type for a single voter.
    // This is what the Member contract would be
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        uint vote;   // index of the voted Option
    }

    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Option` structs.
    Option[] public proposals;

    // Create a new ballot that is populated with options
    function Ballot(bytes32[] proposalNames) {
    	proposals.push(Option({
    		optionName: 'no',
    		voteCount: 0
    	}));
    	proposals.push(Option({
    		optionName: 'yes',
    		voteCount: 0
    	}));
    }

    // Vote on an option that is part of the proposals array
    function vote(uint option) {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted);
        sender.voted = true;
        sender.vote = option;

        // If `option` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[option].voteCount += 1;
    }

    // @dev Computes the winning proposal taking all
    // previous votes into account.
    function winningProposal() constant
            returns (uint winningProposal)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() constant
            returns (bytes32 winnerName)
    {
        winnerName = proposals[winningProposal()].optionName;
    }
}
