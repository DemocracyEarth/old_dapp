import assertRevert from './helpers/assertRevert';

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
  
  describe('registration set up', function () {
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
  
  describe('voting', function () {
    it('should allow registered voters to vote', async function () {
      await this.liquidDemocracyBallot.vote(accounts[0], 0);
      await this.liquidDemocracyBallot.vote(accounts[1], 0);
      await this.liquidDemocracyBallot.vote(accounts[2], 1);
      const voteCountOption0 = await this.liquidDemocracyBallot.getBallotVoteCount(0);
      const voteCountOption1 = await this.liquidDemocracyBallot.getBallotVoteCount(1);

      voteCountOption0.toNumber().should.equal(2);
      voteCountOption1.toNumber().should.equal(1);
    });

    it('should not allow unregistered voters to vote', async function () {
      await assertRevert(this.liquidDemocracyBallot.vote(accounts[4], 0));
    });

    it('should not allow registered voters to vote more than once', async function () {
      await this.liquidDemocracyBallot.vote(accounts[0], 0);
      await assertRevert(this.liquidDemocracyBallot.vote(accounts[0], 0));
    });
  });

  describe('delegating', function () {
    // TODO
  });
});
