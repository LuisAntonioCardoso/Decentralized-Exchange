//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

	address public feeAccount;
	uint256 public feeRate;

	mapping(address => mapping(address => uint256)) public tokenBalanceOf;

	uint256 public orderCount; // orders counter that starts at zero when the order contract is deployed and incremented at every new order
	mapping(uint256 => Order) public orders;
	mapping(uint256 => bool) public ordersCancelled;

	// ----------------------------------------------------------------
	// Structs --------------------------------------------------------

	// way to model the order
	struct Order {
		uint256 id;			// Unique identifier for the order
		address user;		// User who created the order
		address tokenGive;	// token spent
		uint256 amountGive;
		address tokenGet;	// token to receive
		uint256 amountGet;
		uint256 timestamp; // when the order was created
	}

	// ----------------------------------------------------------------
	// Events ---------------------------------------------------------

	event Deposit(
		address token,
		address user,
		uint256 amount,
		uint256 balance
	);

	event Withdraw(
		address token,
		address user,
		uint256 amount,
		uint256 balance
	);

	event OpenOrder(
		uint256 id,
		address user,
		address tokenGive,
		uint256 amountGive,
		address tokenGet,
		uint256 amountGet,
		uint256 timestamp
	);

	event CancelOrder(
		uint256 id,
		address user,
		address tokenGive,
		uint256 amountGive,
		address tokenGet,
		uint256 amountGet,
		uint256 timestamp
	);

	// ----------------------------------------------------------------
	// Constructor ----------------------------------------------------

	constructor(
		address _feeAccount,
		uint256 _feeRate) 
	{
		feeAccount = _feeAccount;
		feeRate = _feeRate;
	}

	// ----------------------------------------------------------------
	// Deposit and Withdraw tokens ------------------------------------

	function depositToken( 
		address _token,
		uint256 _amount)
		public returns(bool success)
	{
		// transfer token to exchange
		require(Token(_token).transferFrom(msg.sender, address(this), _amount), 'token transfer failed');

		// update balances
		tokenBalanceOf[_token][msg.sender] = tokenBalanceOf[_token][msg.sender] + _amount;

		// emit event
		emit Deposit(_token, msg.sender, _amount, tokenBalanceOf[_token][msg.sender]);
		return success;
	}

	function withdrawToken(
		address _token,
		uint256 _amount)
		public returns(bool success)
	{
		//test requisits
		require(tokenBalanceOf[_token][msg.sender] >= _amount, 'insufficient balance');
	
		// transfer tokens (we use transfer and not transfer from, because now we are the holders of the tokens)
		require(Token(_token).transfer(msg.sender, _amount), 'token transfer failed');

		// update user balance
		tokenBalanceOf[_token][msg.sender] = tokenBalanceOf[_token][msg.sender] - _amount;

		// emit event
		emit Withdraw(_token, msg.sender, _amount, tokenBalanceOf[_token][msg.sender]);
		return success;

	}

	function balanceOf(
		address _token,
		address _user)
		public view returns(uint256)
	{
		return tokenBalanceOf[_token][_user];
	}

	// ----------------------------------------------------------------
	// Make and Cancel Orders -----------------------------------------

	// token Give -> token they want to spend (which token and how much)
	// token Get -> token they want to receive (which token and how much)
	function makeOrder(
		address _tokenGive,
		uint256 _amountGive,
		address _tokenGet,
		uint256 _amountGet)
		public
	{
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

		orderCount = orderCount + 1;
		Order memory _order = 	Order(
								orderCount, 
								msg.sender, 
								_tokenGive, 
								_amountGive, 
								_tokenGet, 
								_amountGet,
								block.timestamp // epoch time
		);
		orders[orderCount]=_order;
		
		emit OpenOrder(
			_order.id, 
			_order.user, 
			_order.tokenGive, 
			_order.amountGive, 
			_order.tokenGet,
			_order.amountGet,
			_order.timestamp
		);
	}

	function cancelOrder(uint256 _id) public {

		Order storage _order = orders[_id];
		require(_order.id == _id);
		require(_order.user == msg.sender);
		
		ordersCancelled[_id] = true;

		emit CancelOrder(
			_order.id, 
			_order.user, 
			_order.tokenGive, 
			_order.amountGive, 
			_order.tokenGet,
			_order.amountGet,
			_order.timestamp
		);

	}

}