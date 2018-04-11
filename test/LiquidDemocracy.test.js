const LiquidDemocracy = artifacts.require('LiquidDemocracy');

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('LiquidDemocracy', function (accounts){
    const ballot = ['yes', 'no'];
    
    describe('setting up liquid democracy', function () {
      // this could be beforeEach
      it('should create liquid democracy instance with provided ballot', async function () {
        this.liquidDemocracyBallot = await LiquidDemocracy.new(ballot);
        should.exist(this.liquidDemocracyBallot);
      });
      
      it('should register new voters', async function () {
        this.liquidDemocracyBallot = await LiquidDemocracy.new(ballot);
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[0] });
        const voter1 = await this.liquidDemocracyBallot.getVoterData(accounts[0]);
        should.exist(voter1);
      });
      
    });
});
