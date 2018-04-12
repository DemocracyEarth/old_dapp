const LiquidDemocracy = artifacts.require('LiquidDemocracy');

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('LiquidDemocracy', function (accounts){

  beforeEach(async function () {
    // Set up ballot instance and register 4 voters
    this.liquidDemocracyBallot = await LiquidDemocracy.new();
    for (let i = 0; i < 4; i++) {
      await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[i] });
    }
  });
  
  it('should register voters successfully', async function () {
    const registered = await this.liquidDemocracyBallot.getVoterData(accounts[0]);
    let registeredWeight = registered[0].toString();
    let registeredStatus = registered[1];
    const unregistered = await this.liquidDemocracyBallot.getVoterData(accounts[4]);
    let unregisteredWeight = unregistered[0].toString();
    let unregisteredStatus = unregistered[1];

    registeredWeight.should.equal('1');
    registeredStatus.should.equal(true);
    unregisteredWeight.should.equal('0');
    unregisteredStatus.should.equal(false);
  });  
});
