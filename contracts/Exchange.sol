//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

	address public feeAccount;
	uint256 public feeRate;

	mapping(address => mapping(address => uint256)) public tokenBalanceOf;

	event Deposit(
		address token,
		address user,
		uint256 amount,
		uint256 balance
	);

	constructor(
		address _feeAccount,
		uint256 _feeRate) 
	{
		feeAccount = _feeAccount;
		feeRate = _feeRate;
	}

	function depositToken( 
		address _token,
		uint256 _amount)
		public returns(bool success)
	{
		// transfer token to exchange
		require(Token(_token).transferFrom(msg.sender, address(this), _amount), 'transfer failed');

		// update balances
		tokenBalanceOf[_token][msg.sender] = tokenBalanceOf[_token][msg.sender] + _amount;

		// emit event
		emit Deposit(_token, msg.sender, _amount, tokenBalanceOf[_token][msg.sender]);
		return success;
	}

	function balanceOf(
		address _token,
		address _user)
		public view returns(uint256)
	{
		return tokenBalanceOf[_token][_user];
	}

}