import { ethers } from 'ethers';

import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';

export const loadProvider = (dispatch) => {
	// Connect ethers to the blockchain
	// not needed when using ethers from hardhat because it's different library
	const connection = new ethers.providers.Web3Provider(window.ethereum);

	// since the key and the variable have the same name, we don't need to write it twice
	//dispatch({type:'PROVIDER_LOADED', connection: connection});
	dispatch({ type: 'PROVIDER_LOADED', connection });

	return connection;
};

export const loadAllOrders = async (dispatch, provider, exchange) => {
	const block = await provider.getBlockNumber();

	// Fetch cancelled orders
	const cancelStream = await exchange.queryFilter('CancelOrder', 0, block);
	const cancelledOrders = cancelStream.map((event) => event.args);
	dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders });

	// Fetch filled orders
	const filledStream = await exchange.queryFilter('FillOrder', 0, block);
	const filledOrders = filledStream.map((event) => event.args);
	dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders });

	// Fetch all orders
	const orderStream = await exchange.queryFilter('OpenOrder', 0, block);
	const allOrders = orderStream.map((event) => event.args);
	dispatch({ type: 'ALL_ORDERS_LOADED', allOrders });
};

export const loadNetwork = async (dispatch, provider) => {
	const network = await provider.getNetwork();
	// when can use {<property>} to get only the properties needed ~
	// const { chainId } = await provider.getNetwork();
	const { chainId } = network;

	dispatch({ type: 'NETWORK_LOADED', chainId });

	return chainId;
};

export const loadAccount = async (dispatch, provider) => {
	// this is the standard way to fetch a metamask wallet account
	const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
	// getAddress returns the address of a account (individual or smart contract) in the right format
	const account = ethers.utils.getAddress(accounts[0]);

	dispatch({ type: 'ACCOUNT_LOADED', account });

	let balance = await provider.getBalance(account);
	balance = ethers.utils.formatEther(balance);

	dispatch({ type: 'ETHER_BALANCE_LOADED', balance });

	return account;
};

export const loadTokens = async (dispatch, provider, addresses) => {
	let token, symbol;

	token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
	symbol = await token.symbol();
	dispatch({ type: 'TOKEN_1_LOADED', token, symbol });

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
	symbol = await token.symbol();
	dispatch({ type: 'TOKEN_2_LOADED', token, symbol });

	return token;
};

export const loadExchange = async (dispatch, provider, address) => {
	//TODO: don't know why but even after update the ABI file, it reads as the old one

	//console.log(EXCHANGE_ABI[3].inputs[0].name);
	EXCHANGE_ABI[3].inputs[0].name = 'id';
	//console.log(EXCHANGE_ABI[3].inputs[0].name);

	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
	dispatch({ type: 'EXCHANGE_LOADED', exchange });

	return exchange;
};

// ----------------------------------------------------------------
// LOAD USER BALANCES (WALLET AND EXCHANGE)

export const loadBalances = async (dispatch, exchange, account, tokens) => {
	let balance;

	balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18); // convert balance to ETH
	dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance });

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18); // convert balance to ETH
	dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance });

	balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18); // convert balance to ETH
	dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance });

	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18); // convert balance to ETH
	dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance });
};

// ----------------------------------------------------------------
// TRANSFER TOKENS (DEPOSITS AND WITHDRAWS)

export const transferTokens = async (dispatch, provider, exchange, transferType, token, amount) => {
	let transaction;

	dispatch({ type: 'TRANSFER_REQUEST' });

	try {
		const signer = await provider.getSigner();
		const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

		if (transferType === 'Deposit') {
			transaction = await token.connect(signer).approve(exchange.address, amountToTransfer); // user allows exchange to transfer tokens
			await transaction.wait();
			transaction = await exchange
				.connect(signer)
				.depositToken(token.address, amountToTransfer); // user calls function that make the exchange order the transaction of tokens
			await transaction.wait();
		} else {
			transaction = await exchange
				.connect(signer)
				.withdrawToken(token.address, amountToTransfer); // user calls function that make the exchange order the transaction of tokens
			await transaction.wait();
		}
	} catch (error) {
		// TODO: change this to alert the user in case of error

		dispatch({ type: 'TRANSFER_FAIL' });
		console.error(error);
	}
};

export const subscribeToEvents = (dispatch, exchange) => {
	exchange.on('Deposit', (token, user, amount, balance, event) => {
		dispatch({ type: 'TRANSFER_SUCCESS', event });
	});
	exchange.on('Withdraw', (token, user, amount, balance, event) => {
		dispatch({ type: 'TRANSFER_SUCCESS', event });
	});

	exchange.on(
		'OpenOrder',
		(id, user, tokenGive, amountGive, tokenGet, amountGet, timestamp, event) => {
			const order = event.args;
			dispatch({ type: 'NEW_ORDER_SUCCESS', order, event });
		}
	);

	exchange.on(
		'CancelOrder',
		(id, user, tokenGive, amountGive, tokenGet, amountGet, timestamp, event) => {
			const order = event.args;
			dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event });
		}
	);
};

// ----------------------------------------------------------------
// MAKE ORDERS (BUY AND SELL)

export const makeOrder = async (dispatch, provider, exchange, isBuy, tokens, order) => {
	let transaction, tokenGet, tokenGive, amountGet, amountGive;

	if (isBuy) {
		tokenGet = tokens[0].address;
		amountGet = ethers.utils.parseUnits(order.amount, 18);
		tokenGive = tokens[1].address;
		amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18);
	} else {
		tokenGet = tokens[1].address;
		amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18);
		tokenGive = tokens[0].address;
		amountGive = ethers.utils.parseUnits(order.amount, 18);
	}

	dispatch({ type: 'NEW_ORDER_REQUEST' });

	try {
		const signer = await provider.getSigner();
		transaction = await exchange
			.connect(signer)
			.makeOrder(tokenGet, amountGet, tokenGive, amountGive);
		await transaction.wait();
	} catch (error) {
		// TODO: change this to alert the user in case of error

		dispatch({ type: 'NEW_ORDER_FAIL' });
		console.error(error);
	}
};

// ----------------------------------------------------------------
// LOAD USER BALANCES (WALLET AND EXCHANGE)

export const cancelOrder = async (dispatch, provider, exchange, order) => {
	dispatch({ type: 'ORDER_CANCEL_REQUEST' });

	try {
		const signer = await provider.getSigner();
		const transaction = await exchange.connect(signer).cancelOrder(order.id);
		await transaction.wait();
	} catch (error) {
		// TODO: change this to alert the user in case of error

		dispatch({ type: 'ORDER_CANCEL_FAIL' });
		console.error(error);
	}
};
