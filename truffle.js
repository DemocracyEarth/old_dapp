var mnemonic = "boy robust absurd olive bless cable speed close column control hour rabbit" // @aecc's metamask seed words
module.exports = {
  networks: {
    ropsten: {
        network_id: 3,
        provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/KZSQapS5wjr4Iw7JhgtE"), // infura node in Ropsten test network using @aecc's API KEY
        gas: 2900000
    },
    development: {
        host: "localhost",
        port: 8545,
        network_id: "*", // Match any network id
        gas: 4712388
    }
  }
};
