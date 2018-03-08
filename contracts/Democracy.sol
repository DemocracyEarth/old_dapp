pragma solidity ^0.4.0;

import "./Console.sol";

contract Democracy is Console {

    struct Db {
        mapping(address => bool) representeeActive;
        address[] representees;
    }

    mapping(address => address) delegations;
    mapping(address => Db) votes;
    mapping(address => bool) public exists;

    address[] voters;
    uint public n_voters;
    address public executive;
    address public nextExecutive;

    event Address(address add);
    event NewVoter(address add);
    event TryNewVoter(address add);
    event Addresses(address[] adds);
    event GetVoter();

    event Executive(address exec, uint vts);

    function Democracy() public {

        n_voters = 0;
        executive = msg.sender;

    }

    function getVoters() public returns (address[]) {
        GetVoter();
        return voters;
    }

    /**
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
     * Only I have the power of delegating my vote(s)
     */
    function delegate(address newDelegate) public {

        require(exists[newDelegate]);

        log("newDelegate", address(newDelegate));

        address voterAddress = msg.sender;
        address oldDelegate = delegations[voterAddress];

        delegations[voterAddress] = newDelegate; // Delegate my own vote

        for (uint8 v = 0; v < votes[voterAddress].representees.length; v++) {
            // Add new delegation
            address representee = votes[voterAddress].representees[v];
            log("representee", representee);
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

    function setNextExecutive() public {
        address better;
        uint max = 1;
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
    function newVoter() public {

        address voterAddress = msg.sender;
        TryNewVoter(voterAddress);
        require(votes[voterAddress].representees.length == 0); // Same address cannot become a new voter

        exists[voterAddress] = true;
        delegations[voterAddress] = voterAddress;
        votes[voterAddress].representeeActive[voterAddress] = true; // Delegate the vote to myself
        votes[voterAddress].representees.push(voterAddress); // Add myself as a delegate
        voters.length += 1;
        voters[n_voters] = voterAddress;
        n_voters++;

        NewVoter(voterAddress);

    }

}
