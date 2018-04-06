const LiquidDemocracy = artifacts.require('LiquidDemocracy');

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('LiquidDemocracy', function (accounts){
    var proposals = ['yes', 'no'];
    
    describe('setting up liquid democracy', function () {
      it('should create ballot instance with provided proposals', async function () {
        this.liquidDemocracyBallot = await LiquidDemocracy.new(proposals);
        should.exist(this.liquidDemocracyBallot);
      });
      
      it('should register new voters', async function () {
        this.liquidDemocracyBallot = await LiquidDemocracy.new(proposals);
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[0] });
        const voter1 = await this.liquidDemocracyBallot.getVoterRegistration(accounts[0]);
        // console.log(voter1);
      });
      
    });
});
