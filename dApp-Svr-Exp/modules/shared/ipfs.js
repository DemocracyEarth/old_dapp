(function () {
  'use strict';
  angular.module('dAppSvrApp').factory('apiIPFS', [function() {
    let node;

    function initializeNode(ready){
      node = window.IpfsApi('server.cryptopolitics.global', '5001');
      console.log("IPFS node ready");
      ready(node);
    }
    return {
      node: node,
      initializeNode: initializeNode,
      getBytes32FromIpfsHash: getBytes32FromIpfsHash,
      getIpfsHashFromBytes32: getIpfsHashFromBytes32
    }

    // Return bytes32 hex string from base58 encoded ipfs hash,
    // stripping leading 2 bytes from 34 byte IPFS hash
    // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
    // E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
    // "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
    function getBytes32FromIpfsHash(ipfsListing) {
      return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
    }

    // Return base58 encoded ipfs hash from bytes32 hex string,
    // E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
    // --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"
    function getIpfsHashFromBytes32(bytes32Hex) {
      // Add our default ipfs values for first 2 bytes:
      // function:0x12=sha2, size:0x20=256 bits
      // and cut off leading "0x"
      const hashHex = "1220" + bytes32Hex.slice(2)
      const hashBytes = buffer.Buffer(hashHex, 'hex');
      const hashStr = bs58.encode(hashBytes)
      return hashStr
    }
	}]);
})();