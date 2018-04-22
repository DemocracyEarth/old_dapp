<p align="center">
<img src="images/democracy-earth.png" width="400" title="Democracy Earth Foundation">
</p>

# Liquid Democracy

> 🚨🚧 _Everything in this repo is still a work in progress and higly experimental. It is not secure to use any of this code in production (mainnet) until proper security audits have been conducted._

This is a smart contract implementation of a basic liquid democracy with three initial main functionalities: `vote()`, `delegate()` and `revoke()`. It mainly consists of `LiquidDemocracy.sol` and its corresponding test file `LiquidDemocracy.test.js`. This is the starting point of a roadmap that seeks to bridge Sovereign app with blockchain features. Please make sure you check out the [Waffle board](https://waffle.io/DemocracyEarth/contracts) and the [milestones](https://github.com/DemocracyEarth/contracts/milestones) for more information.

## How to collaborate

PRs and feedback are welcomed. A good place to start is to review the current [open issues](https://github.com/DemocracyEarth/contracts/issues), please feel free to engage with us by commenting in a specific issue. Remember you can also check out the [Waffle board](https://waffle.io/DemocracyEarth/contracts) to understand what's being worked on now and what is coming up next.

## How to test locally

Project is being developed with NodeJs and Truffle, please make sure you have the latest version of npm before continuing. First follow the instructions to install [Truffle](http://truffleframework.com/):

```sh
$ npm install -g truffle
```

Then clone or fork the repo, do an `npm install`, and you can start running the tests. You will need to run `truffle develop` to start a testing blockchain and then `test` to execute testing files. Please read the [Truffle docs](http://truffleframework.com/docs/getting_started/testing) to learn more about the tool.

## Compile contracts

```sh
truffle compile
cp build/contracts/* dApp-Svr-Exp/contracts/
```

## How to deploy the contracts

```sh
$ truffle migrate --network ropsten
```
