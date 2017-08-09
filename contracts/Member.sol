pragma solidity ^0.4.4;

/*
Members belong to an Organization.

Once approved as part of an organization, members gets a specific amount of VOTEs.

Members are able to:
- Vote on decisions of the organization
- Delegate votes to other members
*/

contract Member {
    // Member state variables
    address public creatorAccountAddress;
    uint public weight;
    bool public voted;

    // Constructor 
    function Member(address creatorAccount) {
        creatorAccountAddress = creatorAccount;
        weight = 1;
        voted = false;
    }

    // TODO: vote function
    // TODO: delegate VOTEs to another member
    // TODO: can members belong to many organizations?

}
