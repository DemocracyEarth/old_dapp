pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract VoteToken is StandardToken {
	string public name = 'VoteToken';
	string public symbol = 'VOTE';
	uint public decimals = 2;
	uint public INITIAL_SUPPLY = 12000;

  function VoteToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}