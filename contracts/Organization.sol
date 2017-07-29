pragma solidity ^0.4.4;

/*
Sovereign instace.

Defines governance rules, membership approval and allocation of VOTEs.

Every organization has a constitutional smart contract able to:
- Determine how VOTEs will be allocated to its members
- Set memembership approval (relationship: organization has Members)
- Allow annonymous signatures in Decisions
- Specify Ballot design
*/	

contract Organization {
    // Key/Value pairs of all members of organization
    mapping (string => address) organizationMembers;

    // Constructor
    function Organization() {
    }

    // TODO: Membership approval (add members to organization)

    // TODO: Allocation of VOTEs to members

    // TODO: Governance rules 

}
