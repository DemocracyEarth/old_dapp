var Organization = artifacts.require('Organization');

contract('Organization', function(accounts) {
  
  it('should create an Organization instance with chairperson as first member', function() {
    return Organization.new(accounts[0]).then(function(orgInstance) {
      return orgInstance.members(accounts[0]);
    }).then(function(returnedMember) {
      assert.equal(returnedMember, true, 'First member was not registered to members mapping');
    });
  });

  it('should add a new member to an existing organization', function() {
    return Organization.new(accounts[0]).then(function(orgInstance) {
      orgInstance.addMember(accounts[1]);
      return orgInstance.members(accounts[1]);
    }).then(function(returnedMember) {
      assert.equal(returnedMember, true, 'First member was not registered to members mapping');
    })
  });

});