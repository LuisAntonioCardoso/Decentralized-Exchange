//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Exchange {

	address public feeAccount;
	uint256 public feeRate;

	constructor(
		address _feeAccount,
		uint256 _feeRate) 
	{
		feeAccount = _feeAccount;
		feeRate = _feeRate;
	}



}