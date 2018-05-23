import assertRevert from './helpers/assertRevert';

const LiquidDemocracy = artifacts.require('LiquidDemocracy');

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const nVoters = 4;

contract('LiquidDemocracy', function (accounts){

    beforeEach(async function () {
        // Set up ballot instance and register 4 voters
        this.liquidDemocracyBallot = await LiquidDemocracy.new();
        for (let i = 0; i < nVoters; i++) {
            const dummyIpfsHash = accounts[i];
            await this.liquidDemocracyBallot.registerNewVoter(dummyIpfsHash, { from: accounts[i] });
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

    describe('ballot creation', function () {
        it('a registered user should be able to create a ballot with IPFS name', async function () {
            const ballotTitle = "0x627306090abab3a6e1400e9345bc60c78a8bef57000000000000000000000000";
            const voter = accounts[0];
            await this.liquidDemocracyBallot.createNewBallot(ballotTitle, { from: voter });
            const fetchedTitle = await this.liquidDemocracyBallot.getBallotTitle(0, { from: voter });
            fetchedTitle.should.equal(ballotTitle);
        });
    });

    describe('voting', function () {
        it('should allow registered voters to vote', async function () {
            await this.liquidDemocracyBallot.createNewBallot(accounts[0]);
            await this.liquidDemocracyBallot.vote(0, 1, { from: accounts[0] });
            await this.liquidDemocracyBallot.vote(0, 1, { from: accounts[1] });
            await this.liquidDemocracyBallot.vote(0, 2, { from: accounts[2] });
            const voteCountOption1 = await this.liquidDemocracyBallot.getBallotVoteOption1Count(0);
            const voteCountOption2 = await this.liquidDemocracyBallot.getBallotVoteOption2Count(0);

            voteCountOption1.toNumber().should.equal(2);
            voteCountOption2.toNumber().should.equal(1);
        });

        it('should not allow unregistered voters to vote', async function () {
            await assertRevert(this.liquidDemocracyBallot.vote(0, 1, { from: accounts[4] }));
        });

        it('should not allow registered voters to vote more than once', async function () {
            await this.liquidDemocracyBallot.createNewBallot(accounts[0]);
            await this.liquidDemocracyBallot.vote(0, 1, { from: accounts[0] });
            await assertRevert(this.liquidDemocracyBallot.vote(0, 1, { from: accounts[0] }));
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

    describe('removeDelegation produce the expected output', function () {

        it('delegating and removing delegation are inverse functions', async function () {
            const representee = accounts[0];

            await this.liquidDemocracyBallot.delegate(accounts[1], { from: representee });
            await this.liquidDemocracyBallot.removeDelegation({ from: representee });

            const newRepresentative = await this.liquidDemocracyBallot.getMyRepresentative({ from: representee })
            const newRepresentativeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: accounts[1] })
            const newRepresenteeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: representee })

            newRepresentative.should.equal(representee);
            newRepresentativeWeight.toNumber().should.equal(1);
            newRepresenteeWeight.toNumber().should.equal(1);
        });

        it('removing delegations on the leaf of transitive delegation gives the expected results', async function () {
            const representee = accounts[0];
            const representative1 = accounts[1];
            const representative2 = accounts[2];

            await this.liquidDemocracyBallot.delegate(representative1, { from: representee });
            await this.liquidDemocracyBallot.delegate(representative2, { from: representative1 });

            await this.liquidDemocracyBallot.removeDelegation({ from: representee });

            const newRepresentative = await this.liquidDemocracyBallot.getMyRepresentative({ from: representee })
            const newRepresentative1Weight = await this.liquidDemocracyBallot.getMyWeight({ from: representative1 })
            const newRepresentative2Weight = await this.liquidDemocracyBallot.getMyWeight({ from: representative2 })
            const newRepresenteeWeight = await this.liquidDemocracyBallot.getMyWeight({ from: representee })

            newRepresentative.should.equal(representee);
            newRepresentative1Weight.toNumber().should.equal(1);
            newRepresentative2Weight.toNumber().should.equal(2);
            newRepresenteeWeight.toNumber().should.equal(1);
        });

        it('removing delegations on the middle of transitive delegation gives the expected results', async function () {
            const representee = accounts[0];
            const representative1 = accounts[1];
            const representative2 = accounts[2];

            await this.liquidDemocracyBallot.delegate(representative1, { from: representee });
            await this.liquidDemocracyBallot.delegate(representative2, { from: representative1 });

            await this.liquidDemocracyBallot.removeDelegation({ from: representative1 });

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

    describe('returns voters data', function () {

        it('returns count of voters', async function () {
          const voters = await this.liquidDemocracyBallot.getVotersCount.call();
          voters.toNumber().should.equal(nVoters);
        });

        it('returns an array with all the voters addresses', async function () {
            const voters = await this.liquidDemocracyBallot.getVoters.call();
            for (let j = 0; j < 10; j++) { // 40 users' data
                for (let i = 0; i < voters.length; i++) {
                    const voter = await this.liquidDemocracyBallot.getVoterData.call(voters[i]);
                    const registered = voter[1];
                    const voted = voter[2];
                    const voterIpfsName = voter[3];
                    const voterRepresentative = voter[4];
                    voterRepresentative.should.equal(voters[i]);
                    voted.should.equal(false);
                    registered.should.equal(true);
                    voterIpfsName.length.should.equal(66); // IPFS hash in 64 bytes + 0x bytes
                    voter.length.should.equal(7);
                }
            }
        });

    describe('removes votes', function () {

        it('removes a voters vote', async function () {

            const voter = accounts[0];
            await this.liquidDemocracyBallot.createNewBallot(voter);
            await this.liquidDemocracyBallot.vote(0, 1, { from: voter });
            await this.liquidDemocracyBallot.removeVote({ from: voter });

            const voterData = await this.liquidDemocracyBallot.getVoterData.call(voter);
            const voted = voterData[2];
            const votedOption1 = voterData[5];
            const votedOption2 = voterData[6];
            const count = await this.liquidDemocracyBallot.getBallotVoteOption1Count(0);

            voted.should.equal(false);
            votedOption1.should.equal(false);
            votedOption2.should.equal(false);
            count.toNumber().should.equal(0);
        });

    });

    });

});
