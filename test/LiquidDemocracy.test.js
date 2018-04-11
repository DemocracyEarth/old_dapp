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
        const voter0 = await this.liquidDemocracyBallot.getVoterData(accounts[0]);
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[1] });
        const voter1 = await this.liquidDemocracyBallot.getVoterData(accounts[1]);
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[2] });
        const voter2 = await this.liquidDemocracyBallot.getVoterData(accounts[2]);
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[3] });
        const voter3 = await this.liquidDemocracyBallot.getVoterData(accounts[3]);
        
        should.exist(voter0);
        should.exist(voter1);
        should.exist(voter2);
        should.exist(voter3);
        // console.log(voter0);
        // console.log(voter1);
      });

      it('should allow voters to vote', async function () {
        // console.log(voter0);
        this.liquidDemocracyBallot = await LiquidDemocracy.new(ballot);
        
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[0] });

        await this.liquidDemocracyBallot.vote(accounts[0], 0);

        const voteCount = await this.liquidDemocracyBallot.getBallotVoteCount(0);
        console.log(voteCount);

        // TODO - should refactor to use beforeEach, 
        // the setup should be taken care there,
        // basically create ballot and register voters
      });
      
    });
});
