// reducers are used to add things to the store
// since we are going to use the reducers in other files, we need to use "export" (in the interactions file)

export const provider = (state = {}, action) => {

	switch (action.type) {
		case 'PROVIDER_LOADED':
			return {
				...state,
				connection: action.connection
			};
		
		case 'NETWORK_LOADED':
			return {
				...state,
				chainId: action.chainId
			};

		case 'ACCOUNT_LOADED':
			return {
				...state,
				account: action.account
			};
		case 'ETHER_BALANCE_LOADED':
			return {
				...state,
				balance: action.balance
			};

		default:
			return state;
	}
}

const DEFAULT_TOKENS_STATE = { 
	loaded: false, 
	contracts: [], 
	symbols: [] 
};

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {

	switch (action.type) {
		case 'TOKEN_1_LOADED':
			return {
				...state,
				loaded: action.connection,
				// Here we don't use "[...state.contracts" because we don't want to add on 
				// 	top of what we already have, instead we want to overwrite
				contracts: [action.token],
				symbols: [action.symbol]
			};
		case 'TOKEN_2_LOADED':
			return {
				...state,
				loaded: action.connection,
				contracts: [...state.contracts, action.token],
				symbols: [...state.symbols, action.symbol]
			};

		default:
			return state;
	}
}

const DEFAULT_EXCHANGE_STATE = { 
	loaded: false, 
	contract: {}
};

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {

	switch (action.type) {
		case 'EXCHANGE_LOADED':
			return {
				...state,
				loaded: true,
				contract: action.exchange
			};
		

		default:
			return state;
	}
}
