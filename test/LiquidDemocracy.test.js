const LiquidDemocracy = artifacts.require('LiquidDemocracy');

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('LiquidDemocracy', function (accounts){
    var proposals = ['yes', 'no'];

    beforeEach(async function () {
        this.liquidDemocracyBallot = await LiquidDemocracy.new(proposals);
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[0] });
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[1] });
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[2] });
    });
    
    describe('setting up liquid democracy', function () {
      it('should create ballot instance with provided proposals', async function () {
        this.liquidDemocracyBallot = await LiquidDemocracy.new(proposals);
        should.exist(this.liquidDemocracyBallot);
      });
      
      it('should register new voters', async function () {
        this.liquidDemocracyBallot = await LiquidDemocracy.new(proposals);
        await this.liquidDemocracyBallot.registerNewVoter({ from: accounts[0] });
        const voter1 = await this.liquidDemocracyBallot.getVoterData(accounts[0]);
        should.exist(voter1);
      });
      
    });

    describe('delegations produce the expected output', function () {

        it('should perform a simple delegation', async function () {
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[0] });

            const representative = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[0] })
            const representativeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const representeeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[0] })

            assert.equal(representative, accounts[1]);
            assert.equal(representativeWeight, 2);
            assert.equal(representeeWeight, 0);
        });

        it('should perform 1 hop transitive delegation', async function () {
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[0] });
            await this.liquidDemocracyBallot.delegate(accounts[2], { from: accounts[1] });

            const representative1 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[0] })
            const representative2 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[1] })
            const representative1Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const representative2Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[2] })
            const representeeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[0] })

            assert.equal(representative1, accounts[1]);
            assert.equal(representative2, accounts[2]);
            assert.equal(representative1Weight, 0);
            assert.equal(representative2Weight, 3);
            assert.equal(representeeWeight, 0);
        });

        it('should perform a fork delegation', async function () {
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[0] });
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[2] });

            const representative1 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[0] })
            const representative2 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[2] })
            const representativeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const representee1Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[0] })
            const representee2Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[2] })

            assert.equal(representative1, representative2);
            assert.equal(representative1, accounts[1]);
            assert.equal(representative2, accounts[1]);
            assert.equal(representativeWeight, 3);
            assert.equal(representee1Weight, 0);
            assert.equal(representee2Weight, 0);
        });

    });
});
