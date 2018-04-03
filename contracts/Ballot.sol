pragma solidity ^0.4.4;

/*
A Ballot presents a topic with options for users to vote
*/

contract Ballot {
	// This is the type for a single option shown in a ballot
	struct Proposal {
        bytes32 name; // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    // Create a new ballot that is populated with proposals
    function Ballot(bytes32[] proposalNames) {

    	// For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // WIP 
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function getProposalsLength() public view returns(uint length) {
        return proposals.length;
    }

    function getProposalName(uint proposal) public view returns (bytes32 name) {
        return proposals[proposal].name;
    }

    function getProposalVoteCount(uint proposal) public view returns (uint voteCount) {
        return proposals[proposal].voteCount;
    }

    function receiveVote(uint proposal) public view returns (bool successful) {
        proposals[proposal].voteCount += 1;
        return true;
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    /// TODO: handle drawings
    function winningProposal() view public
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
    function winnerName() view public
            returns (bytes32 winnerName)
    {
        winnerName = proposals[winningProposal()].name;
    }
}
