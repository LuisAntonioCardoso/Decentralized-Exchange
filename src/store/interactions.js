import { ethers } from 'ethers';

import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';
import { provider } from './reducers';


export const loadProvider = (dispatch) => {

	// Connect ethers to the blockchain
    // not needed when using ethers from hardhat because it's different library
	const connection = new ethers.providers.Web3Provider(window.ethereum);
	
	// since the key and the variable have the same name, we don't need to write it twice
	//dispatch({type:'PROVIDER_LOADED', connection: connection});
	dispatch({type:'PROVIDER_LOADED', connection});

	return connection;
}

export const loadNetwork = async (dispatch, provider) => {
	const network = await provider.getNetwork(); 
    // when can use {<property>} to get only the properties needed ~
	// const { chainId } = await provider.getNetwork(); 
    const { chainId } = network;

	dispatch({ type: 'NETWORK_LOADED', chainId});

	return chainId;
}

export const loadAccount = async (dispatch, provider) => {
	// this is the standard way to fetch a metamask wallet account
	const accounts = await window.ethereum.request({ method:'eth_requestAccounts' });
	// getAddress returns the address of a account (individual or smart contract) in the right format 
	const account = ethers.utils.getAddress(accounts[0]);

	dispatch({ type: 'ACCOUNT_LOADED', account});

	let balance = await provider.getBalance(account);
	balance = ethers.utils.formatEther(balance);

	dispatch({ type: 'ETHER_BALANCE_LOADED', balance});

	return account;
}

export const loadTokens = async (dispatch, provider, addresses) => {

	let token, symbol;

	token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
	symbol = await token.symbol();
	dispatch({ type: 'TOKEN_1_LOADED', token, symbol });

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
	symbol = await token.symbol();
	dispatch({ type: 'TOKEN_2_LOADED', token, symbol });
	
	return token;
}

export const loadExchange = async (dispatch, provider, address) => {

	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
	dispatch({ type: 'EXCHANGE_LOADED', exchange });
	
	return exchange;
}

// ----------------------------------------------------------------
// LOAD USER BALANCES (WALLET AND EXCHANGE)

export const loadBalances = async (dispatch, exchange, account, tokens) => {

	let balance;

	balance = ethers.utils.formatUnits( await tokens[0].balanceOf(account) , 18); // convert balance to ETH 
	dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance });

	balance = ethers.utils.formatUnits( await exchange.balanceOf(tokens[0].address, account) , 18); // convert balance to ETH 
	dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance });

	balance = ethers.utils.formatUnits( await tokens[1].balanceOf(account) , 18); // convert balance to ETH 
	dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance });

	balance = ethers.utils.formatUnits( await exchange.balanceOf(tokens[0].address, account) , 18); // convert balance to ETH 
	dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance });
}

// ----------------------------------------------------------------
// TRANSFER TOKENS (DEPOSITS AND WITHDRAWS)

export const transferTokens = async (dispatch, provider, exchange, transferType, token, amount) => {

	let transaction;

	dispatch({ type: 'TRANSFER_REQUEST' });

	try {
		
		const signer = await provider.getSigner();
		const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

		transaction = await token.connect(signer).approve(exchange.address, amountToTransfer); // user allows exchange to transfer tokens 
		await transaction.wait();
		transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer); // user calls function that make the exchange order the transaction of tokens
		await transaction.wait();

	} catch (error) {
		// TODO: change this to alert the user in case of error

		dispatch({ type: 'TRANSFER_FAIL' });
		console.error(error);
	}

}

export const subscribeToEvents = (dispatch, exchange) => {

	exchange.on('Deposit', (token, user, amount, balance, event) => {

		dispatch({ type: 'TRANSFER_SUCCESS', event })
	})
}
