// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

contract Token {

    // state variable that gets writen directly to the blockchain
    // variable belongs to the smart contract
    // mark it as public allows it to be seen from the outside and create automatically a read function
    string public name;
    string public symbol;
    uint256 public decimals = 18; // number of decimal of the currency; same as etherium and used by most cryptos
    uint256 public totalSupply; // we have 1000 total supply, but we need to consider the decimals

    mapping(address => uint256) public balanceOf; // save balances of the addresses

    event Transfer( 
        address indexed from,
        address indexed to,
        uint256 value); // event to be called when a transfer is done

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply) 
    {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply; // atribute the total supply of the curency will be sent to the creator
    }

    function transfer(
            address _to, 
            uint256 _value) 
        public returns(
            bool sucess) 
    {
        // verify if sender has enough tokens to send
        require(balanceOf[msg.sender] >= _value);
        // check if sender is not the receiver
        require(_to != address(0));
        // debit sender
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        // credit receiver
        balanceOf[_to] = balanceOf[_to] + _value;
        // emit event
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

}
