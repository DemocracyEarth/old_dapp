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
            await this.liquidDemocracyBallot.vote(0, { from: accounts[0] });
            await this.liquidDemocracyBallot.vote(0, { from: accounts[1] });
            await this.liquidDemocracyBallot.vote(1, { from: accounts[2] });
            const voteCountOption0 = await this.liquidDemocracyBallot.getBallotVoteCount(0);
            const voteCountOption1 = await this.liquidDemocracyBallot.getBallotVoteCount(1);

            voteCountOption0.toNumber().should.equal(2);
            voteCountOption1.toNumber().should.equal(1);
        });

        it('should not allow unregistered voters to vote', async function () {
            await assertRevert(this.liquidDemocracyBallot.vote(0, { from: accounts[4] }));
        });

        it('should not allow registered voters to vote more than once', async function () {
            await this.liquidDemocracyBallot.vote(0, { from: accounts[0] });
            await assertRevert(this.liquidDemocracyBallot.vote(0, { from: accounts[0] }));
        });
    });

    describe('delegations produce the expected output', function () {

        it('should perform a simple delegation', async function () {
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[0] });

            const representative = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[0] })
            const representativeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const representeeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[0] })

            representative.should.equal(accounts[1]);
            representativeWeight.toNumber().should.equal(2);
            representeeWeight.toNumber().should.equal(1);
        });

        it('should perform 1 hop transitive delegation', async function () {
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[0] });
            await this.liquidDemocracyBallot.delegate(accounts[2], { from: accounts[1] });

            const representative1 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[0] })
            const representative2 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[1] })
            const representative1Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const representative2Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[2] })
            const representeeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[0] })

            representative1.should.equal(accounts[1]);
            representative2.should.equal(accounts[2]);
            representative1Weight.toNumber().should.equal(2);
            representative2Weight.toNumber().should.equal(3);
            representeeWeight.toNumber().should.equal(1);
        });

        it('should perform a fork delegation', async function () {
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[0] });
            await this.liquidDemocracyBallot.delegate(accounts[1], { from: accounts[2] });

            const representative1 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[0] })
            const representative2 = await this.liquidDemocracyBallot.getMyRepresentative({ from: accounts[2] })
            const representativeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const representee1Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[0] })
            const representee2Weight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[2] })

            representative1.should.equal(representative2);
            representative1.should.equal(accounts[1]);
            representative2.should.equal(accounts[1]);
            representativeWeight.toNumber().should.equal(3);
            representee1Weight.toNumber().should.equal(1);
            representee2Weight.toNumber().should.equal(1);
        });

    });

    describe('revokes produce the expected output', function () {

        it('delegating and revoking are inverse functions', async function () {
            const representee = accounts[0];

            await this.liquidDemocracyBallot.delegate(accounts[1], { from: representee });
            await this.liquidDemocracyBallot.revoke({ from: representee });

            const newRepresentative = await this.liquidDemocracyBallot.getMyRepresentative({ from: representee })
            const newRepresentativeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const newRepresenteeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: representee })

            newRepresentative.should.equal(representee);
            newRepresentativeWeight.toNumber().should.equal(1);
            newRepresenteeWeight.toNumber().should.equal(1);
        });

        it('revoking on the leaf of transitive delegation gives the expected results', async function () {
            const representee = accounts[0];
            const representative1 = accounts[1];
            const representative2 = accounts[2];

            await this.liquidDemocracyBallot.delegate(representative1, { from: representee });
            await this.liquidDemocracyBallot.delegate(accounts[2], { from: representative1 });

            await this.liquidDemocracyBallot.revoke({ from: representee });

            const newRepresentative = await this.liquidDemocracyBallot.getMyRepresentative({ from: representee })
            const newRepresentative1Weight = await this.liquidDemocracyBallot.getMyWeight({ from: representative1 })
            const newRepresentative2Weight = await this.liquidDemocracyBallot.getMyWeight({ from: representative2 })
            const newRepresenteeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: representee })

            newRepresentative.should.equal(representee);
            newRepresentative1Weight.toNumber().should.equal(1);
            newRepresentative2Weight.toNumber().should.equal(2);
            newRepresenteeWeight.toNumber().should.equal(1);
        });

        it('revoking on the middle of transitive delegation gives the expected results', async function () {
            const representee = accounts[0];
            const representative1 = accounts[1];
            const representative2 = accounts[2];

            await this.liquidDemocracyBallot.delegate(representative1, { from: representee });
            await this.liquidDemocracyBallot.delegate(accounts[2], { from: representative1 });

            await this.liquidDemocracyBallot.revoke({ from: representative1 });

            const newRepresentative = await this.liquidDemocracyBallot.getMyRepresentative({ from: representative1 })
            const newRepresentative1Weight = await this.liquidDemocracyBallot.getMyWeight({ from: representative1 })
            const newRepresentative2Weight = await this.liquidDemocracyBallot.getMyWeight({ from: representative2 })
            const newRepresenteeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: representee })

            newRepresentative.should.equal(representative1);
            newRepresentative1Weight.toNumber().should.equal(2);
            newRepresentative2Weight.toNumber().should.equal(1);
            newRepresenteeWeight.toNumber().should.equal(1);
        });

    });

});
