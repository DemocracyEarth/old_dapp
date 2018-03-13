pragma solidity ^0.4.0;

import "./Console.sol";

/**
* A liquid democracy organization that seeks to have a single individual with access to the organization finances.
* Every individual is a voter and the voter with the majority of votes assigned is the designated executive.
*
* Assumptions:
*
* 1 voter is 1 address
* Every voter has a unique vote
* Every voter can be elected
* There is just 1 permanent poll in progress.
* 1 voter can (if he/she wishes to) delegate to another single voter.
*
*/
contract Delegation is Console {

    struct RepresenteesData {
        mapping(address => bool) representeeActive;
        address[] representees;
    }

    mapping(address => address) delegations;
    mapping(address => RepresenteesData) votes;

    uint public n_voters;
    address[] voters; // Current voters
    address public executive; // Current executive
    address public nextExecutive; // Next one to be executive according to vote majority

    event Address(address add);
    event NewVoter(address add);
    event Addresses(address[] adds);
    event GetVoter();
    event Executive(address exec, uint vts);

    modifier onlyExecutive {
        require(msg.sender == executive);
        _;
    }

    function Delegation() public {
        n_voters = 0;
//        executive = msg.sender; //TODO
    }

    function getVoters() public view returns (address[]) {
        return voters;
    }

    /**
    * Gets representatives of voters, in the same order as in the voter's list
    * TODO: maximum return of 100 should be changed!
    */
    function getRepresentatives() public view returns (address[100]) {

        address[100] memory representatives;
        for (uint8 v = 0; v < n_voters; v++) {
            representatives[v] = delegations[voters[v]];
        }
        return representatives;
    }

    /**
     * Delegate the vote power of the sender to another voter
     * Only the person calling this function has the power of delegating his/her vote
     */
    function delegate(address newDelegate) public {

//        require(delegations[newDelegate] != null);

        log("newDelegate", address(newDelegate));

        address voterAddress = msg.sender;
        address oldDelegate = delegations[voterAddress];

        delegations[voterAddress] = newDelegate; // Delegate my own vote

        for (uint8 v = 0; v < votes[voterAddress].representees.length; v++) {
            // Add new delegation
            address representee = votes[voterAddress].representees[v];
            votes[newDelegate].representees.push(representee);
            votes[newDelegate].representeeActive[representee] = true;
            // Remove old delegations
            votes[voterAddress].representeeActive[representee] = false;
            delegations[representee] = newDelegate;
        }
        votes[voterAddress].representees.length = 0;

        // Remove myself of old delegate representees
        votes[oldDelegate].representeeActive[voterAddress] = false;
    }

    /**
    * Calculates who has the majority of the voting power. That one will be set as the next executive.
    */
    function setNextExecutive() public {
        address better;
        uint max = 0;
        for (uint8 v = 0; v < voters.length; v++) {
            uint8 size = 0;
            // Count active representees
            address currentVoter = voters[v];
            for (uint8 r = 0; r < votes[currentVoter].representees.length; r++) {
                address representee = votes[currentVoter].representees[r];
                if (votes[currentVoter].representeeActive[representee]) {
                    size++;
                }
            }
            if (size > max) {
                max = size;
                better = currentVoter;
            }
        }
        Executive(better, max);
        nextExecutive = better;
    }

    /**
     * Creates a new voter using the sender address as unique identifier
     */
    function newVoter() payable public {

        require(msg.value > 100);

        address voterAddress = msg.sender;
        require(votes[voterAddress].representees.length == 0); // Address already defined as a voter cannot become a new voter

        // Set the executive as the first voter
        if (n_voters == 0) {
            executive = voterAddress;
            nextExecutive = voterAddress;
        }

        delegations[voterAddress] = voterAddress;
        votes[voterAddress].representeeActive[voterAddress] = true; // Delegate the vote to myself
        votes[voterAddress].representees.push(voterAddress); // Add myself as a representee
        voters.push(voterAddress);
        n_voters++;

        NewVoter(voterAddress);

    }

    /**
    * Select a new executive according to majority of voting power
    */
    function yieldPower() onlyExecutive public {
        executive = nextExecutive;
    }

    function transferTo(address to) onlyExecutive public {
        to.transfer(100);
    }

    function getExecutiveBalance() public view returns (uint) {
        return this.balance;
    }

}
