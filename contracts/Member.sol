pragma solidity ^0.4.4;

/*
Members belong to an Organization.

Once approved as part of an organization, members gets a specific amount of VOTEs.

Members are able to:
- Vote on decisions of the organization
- Delegate votes to other members
*/

contract Member {
    // Key/value pairs of the organization a member belongs to
    mapping (string => address) organizations;

    // Constructor 
    function Member() {
    }

    // Vote on decisions of the member's organization
    function vote() {

    }

    // Delegate VOTEs to another member
    function delegate() {

    }

}
