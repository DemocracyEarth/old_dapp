pragma solidity ^0.4.0;

// Using Console to log events for debugging purposes, it should be removed when contracts are in production
contract Console {
    event LogUint(string, uint);
    function log(string s , uint x) public {
        LogUint(s, x);
    }

    event LogInt(string, int);
    function log(string s , int x) public {
        LogInt(s, x);
    }

    event LogBytes(string, bytes);
    function log(string s , bytes x) public {
        LogBytes(s, x);
    }

    event LogBytes32(string, bytes32);
    function log(string s , bytes32 x) public {
        LogBytes32(s, x);
    }

    event LogAddress(string, address);
    function log(string s , address x) public {
        LogAddress(s, x);
    }

    event LogBool(string, bool);
    function log(string s , bool x) public {
        LogBool(s, x);
    }
}
