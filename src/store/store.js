// most things in this file is template code
// the only thing that differs between projects is the reducers

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import {
	provider,
	tokens,
	exchange
} from './reducers.js';

// this is where we add reducers that interact with the store, created in the reducers file
// and where they are combined into one
const reducer = combineReducers({
	provider,
	tokens,
	exchange
})

const initialState = {};

const middleware = [thunk];

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));

export default store;
