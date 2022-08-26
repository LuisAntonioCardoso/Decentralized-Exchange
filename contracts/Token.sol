// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

contract Token {

    // state variable that gets writen directly to the blockchain
    // variable belongs to the smart contract
    // mark it as public allows it to be seen from the outside and create automatically a read function
    string public name = "My token";

}
