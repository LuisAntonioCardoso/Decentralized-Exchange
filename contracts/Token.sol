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

    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer( 
        address indexed from,
        address indexed to,
        uint256 value); // event to be called when a transfer is done

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value);

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
        public returns(bool sucess) 
    {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value) 
        internal    // funciton that can only be called inside the construct
    {
        // verify if sender has enough tokens to send
        require(balanceOf[_from] >= _value);
        // check if sender is not the receiver
        require(_to != address(0));
        // debit sender
        balanceOf[_from] = balanceOf[_from] - _value;
        // credit receiver
        balanceOf[_to] = balanceOf[_to] + _value;
        // emit event
        emit Transfer(_from, _to, _value);
    }

    function approve(
        address _spender,
        uint256 _value) 
        public returns(bool success) 
    {
        require(balanceOf[msg.sender] >= _value);
        require(_spender != address(0));

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value) 
        public returns(bool success)
    {
        require(allowance[_from][msg.sender] >= _value);

        // update allowance
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

        // transfer tokens
        _transfer(_from, _to, _value);

        return true;
    }

}
