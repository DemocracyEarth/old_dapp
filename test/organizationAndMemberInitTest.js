/*
  Here we can test spinning up a new organization
  that uses a mapping data structure.
  That is, trying to test if we can successfully link 
  the Member contract with the Organization contract.
*/

var Organization = artifacts.require("./Organization.sol");
var Member = artifacts.require("./Member.sol");

contract('#organization-member-test', function(accounts) {
  
  // So the account address and the member contract address
  // associated with it would belong to the same person
  // that is the organization mapping can simply be 
  // (address [memberContractAddress] => bool [true or false])
  it("should create a member and include it in an organization", function() {
    var memberAddress = null; 
    var firstOrgMember = null;

    // Create a member instance first
    return Member.new(accounts[0]).then(function(memberInstance) {
      memberAddress = memberInstance.address;
      // Then create an organization with that member as chairperson
      return Organization.new(memberAddress);
    }).then(function(organizationInstance) {
      // Next check if that member was indeed included in organization
      return organizationInstance.members(memberAddress)
    }).then(function(returnedMember) {
      firstOrgMember = returnedMember;
    }).then(function() {
      assert.equal(firstOrgMember, true, "Member address is not registered in organization");
    });
  });
});
