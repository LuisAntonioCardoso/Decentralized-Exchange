import { ethers } from 'ethers';

import TOKEN_ABI from '../abis/Token.json';
//import EXCHANGE_ABI from '../abis/Exchange.json';


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
    // when can use {<property>} to get only the properties needed 
    const { chainId } = network;

	dispatch({ type: 'NETWORK_LOADED', chainId});

	return chainId;
}

export const loadAccount = async (dispatch) => {
	const accounts = await window.ethereum.request({ method:'eth_requestAccounts' });
	// getAddress returns the address of a account (individual or smart contract) in the right format 
	const account = ethers.utils.getAddress(accounts[0]);

	dispatch({ type: 'ACCOUNT_LOADED', account});

	return account;
}

export const loadToken = async (dispatch, provider, address) => {

	let token, symbol;

	token = new ethers.Contract(address, TOKEN_ABI, provider);
    symbol = await token.symbol();

	dispatch({ type: 'TOKEN_LOADED', token, symbol });

	return token;
}


