<p align="center">
<img src="images/democracy-earth.png" width="400" title="Democracy Earth Foundation">
</p>

# Social Smart Contract

To visualize a live demo, go to [http://delegation.cryptopolitics.global]

> 🚨🚧 _Everything in this repo is still a work in progress and higly experimental. It is not secure to use any of this code in production (mainnet) until proper security audits have been conducted._ 🚧🚨

An ideal voting system must be able to satisfy in the greatest possible extent these conditions:

* Secrecy: voter must be able to cast vote in secret.

* Verifiability: voter must be able to verify tallied vote.

* Integrity: system must be able to verify correct vote tally.

Additionally, due to the risk that coercion through physical violence or threats in contexts prone to political violence, an option able to protect coerced voters must be introduced:

* Resistance: voter must be able to override own vote if necessary.

The Democracy Earth token granting voting rights will be branded with the single most important message any democracy can convey: _VOTE_. `VOTE` tokens can be implemented using smart contracts and operate within the institutional boundaries created by this set of contracts: `Organizations`, `Members`, `Issues`, `Ballots` and `Budgets`. These are the building blocks that help create a governance circuit that can scale to operate liquid democracies within communities of any size.

<p align="center">
<img src="images/vote-liquid-democracy-smart-contracts.png" title="Democracy smart contracts">
</p>

## Organizations

The entity or institution implementing a Sovereign instance is referred as an `Organization`. This entity acts as a governing authority definining who are the `Members` allowed to participate in its decisions and granting them `VOTE` tokens. For this purpose, every organization has a `constitutional smart contract` that defines its foundational rules in the form of a smart contract.

## Members

Every Organization has members that get the right to vote on the decisions of the organization. Membership approval is defined in `constitutional smart contract` of the organization, setting how open or closed as an institution this entity will be.

## Issues

An organization consists of a collection of `issues` each describing a decision to be made by the members. In the `constitutional smart contract` of an organization it can be defined whether any member or a subset with special rights (e.g. members that have a minimum amount of `VOTEs`) can post an open decision to be voted.

## Ballots

An issue can be implemented with any possible ballot design according to the specifications defined in the `constitutional smart contract` of the organization.

## Budgets 

If the final tally of a decision reaches a certain value (`true` or `false`), it can then enforce the final decision by unlocking coins or triggering a transaction sending assets to a specific address. Budgets specify the conditions and funds attached to the final tally of a voted issue.

# How to test locally

Project is being developed with Truffle and Ganache / Metamask (Ropstein test network), you will find both Solidity and JS (script/testing). First follow the respective instructions to install both [Truffle](http://truffle.readthedocs.io/en/beta/getting_started/installation/) and [ganache](http://truffleframework.com/ganache/):

```sh
$ npm install
```
```sh
$ npm install -g truffle
```

Download Ganache and install

Then follow the steps below to test locally. You can either execute scripts with `truffle exec` or run unit tests with `truffle test`, feel free to check out files in `/test` and `/scripts/for-dev-testing` to follow along with code as you run tests.

* Start from the project directory in the terminal with a `git pull` to make sure you are up to date.
* Start ganache. This will be the simulated blockchain to test on. Note it comes preset with 10 available accounts.
* Turn to project directory terminal and run either:

```sh
$ truffle exec scripts/for-dev-testing/[your script choice]
```
```sh
$ truffle test test/[your test choice]
```

or:

```sh
$ sudo npm run dev
```
If you want to run the web application.
It will default to use Metamask and testnet. You must have Metamask chrome plugin installed to be able to write to the blockchain from the web app.
If you want to change it go to: initWeb3() function in App.js.
To load ether, use faucet: https://faucet.bitfwd.xyz/

### To deploy to the testnet

```sh
truffle migrate --network ropsten
```


## Gotchas and known errors

* It's currently unstable to run all unit tests with just `truffle test`. See [this issue](https://github.com/ethereumjs/testrpc/issues/346) for example on the sort of errors that come up sometimes. Recommended to run each unit test seperately.
