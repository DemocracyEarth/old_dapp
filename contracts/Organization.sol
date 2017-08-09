pragma solidity ^0.4.4;

// import {Member} from "./Member.sol";

/*
Sovereign instance.

Defines governance rules, membership approval and allocation of VOTEs.

Every organization has a constitutional smart contract able to:
- Determine how VOTEs will be allocated to its members
- Set memembership approval (relationship: organization has Members)
- Allow annonymous signatures in Decisions
- Specify Ballot design
*/	

contract Organization {
    // Store a boolean to whether a member belongs to organization or not
    mapping (address => bool) public members;

	// Organization lead/founder/admin
	address public chairperson;

    // Constructor
    function Organization(address member) {
    	// chairperson = msg.sender;
        members[member] = true;
    }

    // TODO: Membership approval (add members to organization)

    // TODO: Allocation of VOTEs to members

    // TODO: Governance rules 

}
