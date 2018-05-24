<p align="center">
<img src="images/democracy-earth.png" width="400" title="Democracy Earth Foundation">
</p>

# Liquid Democracy as a smart contract

> 🚨🚧 _Everything in this repo is still a work in progress and higly experimental. It is not secure to use any of this code in production (mainnet) until proper security audits have been conducted._

This is a smart contract implementation (Dapp) in the Ethereum blockchain of a [liquid democracy](https://github.com/DemocracyEarth/paper) with three initial main functionalities: `vote()`, `delegate()` and `revoke()`. It mainly consists of `LiquidDemocracy.sol` and its corresponding test file `LiquidDemocracy.test.js`. This is the starting point of a roadmap that seeks to bridge [Sovereign app](https://github.com/DemocracyEarth/sovereign) with blockchain features. Please make sure you check out the [Waffle board](https://waffle.io/DemocracyEarth/contracts) and the [milestones](https://github.com/DemocracyEarth/dapp/milestones) for more information.

The most recent version of the dapp is uploaded in [http://dapp.democracy.earth](). 
For desktop instal metamask or a metamask-supported browser to be able to interact with it.
For mobile, use a dapp browser / wallet like [Toshi](https://www.toshi.org/)

## Contributing

PRs and feedback are welcomed. A good place to start is to review the current [open issues](https://github.com/DemocracyEarth/dapp/issues), please feel free to engage with us by commenting in a specific issue. Remember you can also check out the [Waffle board](https://waffle.io/DemocracyEarth/contracts) to understand what's being worked on now and what is coming up next.

Dapp development is discussed actively in the slack channel [#dev-dapp](https://democracyearth.slack.com/messages/C099CSN93) in democracyearth.slack.com 

The dapp consists of mailnly two elements, contracts and frontend, located respectively in the following folders:
- **contracts**: solidity contracts, to be deployed to a local or remote blockchain.
- **dApp-Srv-Exp**: JS frontend built using npm, bower and http-server

## Development dependencies

- NodeJS
  - Bower (`npm install -g bower`)
  - Truffle (`npm install -g truffle`)
  - http-server (`npm install -g http-server`)
- Ganache ([http://truffleframework.com/ganache/]())
- Metamask browser extension ([https://metamask.io/]())

## How to run

### Compile, deploy and copy compiled contracts to frontend

Choose the environment.
Use *development* for local environment or *ropsten* for ropsten ethereum test network in remote environment.

 ```sh
 $ truffle compile
 $ truffle migrate --network [development / ropsten]
 $ cp build/contracts/* dApp-Svr-Exp/contracts/
 ```
 
Start **ganache** in case of local environment

### Start frontend

```sh
$ http-server dApp-Svr-Exp/
```

### Access

Make sure to set metamask to the right environment (Private network or Ropsten)

[http://localhost:8080]()

### Funding

#### Local environment

Import private keys from ganache into Metamask (Accounts -> Import account)

#### Remote environment

Use a Ropsten faucet. e.g.: [http://faucet.ropsten.be:3001/]()
