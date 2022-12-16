import { createSelector } from 'reselect';
import { get, groupBy, reject } from 'lodash';
import moment from 'moment';
import { ethers } from 'ethers';

const tokens = state => get(state, 'tokens.contracts');
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = state => get(state, 'exchange.filledOrders.data', []);
const allOrders = state => get(state, 'exchange.allOrders.data', []);

const openOrders = state => {
	const cancelled = cancelledOrders(state);
	const filled = filledOrders(state);
	const all = allOrders(state);

	const openOrders = reject( all, (order) => {
		const orderCancelled = cancelled.some( (o) => o.id.toString() === order.id.toString() ); // verify if the order in all has the same id of one in cancelled
		const orderFilled = filled.some( (o) => o.orderId.toString() === order.id.toString() ); // verify if the order in all has the same id of one in filled
		return( orderCancelled || orderFilled ); // if the order exists in cancelled or in filled, then proceed to reject
	});

	return openOrders;
}

const decorateOrder = (order, tokens) => {

	let token0Amount, token1Amount;

	if( order.tokenGive === tokens[1].address)
	{
		token0Amount = order.amountGive;
		token1Amount = order.amountGet;
	}
	else
	{
		token0Amount = order.amountGet;
		token1Amount = order.amountGive;
	}

	// calculate price with 5 decimal places
	const precision = 100000;
	let tokenPrice = (token1Amount/token0Amount);
	tokenPrice = Math.round(tokenPrice * precision) / precision; // this is what is going to round things

	return ({
		...order,
		token0Amount: Math.round( ethers.utils.formatUnits(token0Amount,"ether") * 10) / 10,
		token1Amount: Math.round( ethers.utils.formatUnits(token1Amount,"ether") * 10) / 10,
		tokenPrice,	// if the name of the attribute returned is the same as the variable that contains the data, you don't need to write everything ("tokenPrice : tokenPrice")
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
	});
}

// ----------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
	openOrders,
	tokens,
	(orders, tokens) =>
	{
		if( !tokens[0] || !tokens[0] ) return;

		// filter orders by selectedTokens
		orders = orders.filter( (order) => order.tokenGet === tokens[0].address || order.tokenGet === tokens[1].address );
		orders = orders.filter( (order) => order.tokenGive === tokens[0].address || order.tokenGive === tokens[1].address );

		// decorate orders (by going through everyone individually)
		// decoration with the purpose of make it easy to access the information about the order later
		orders = decorateOrderBookOrders(orders, tokens);

		// group order by order type
		orders = groupBy(orders, 'orderType');

		// sort buy order by price
		const buyOrders = get(orders, 'buy', []);
		orders = {
			...orders,
			buyOrders: buyOrders.sort( (a,b) => b.tokenPrice - a.tokenPrice )
		}
		// sort sell order by price
		const sellOrders = get(orders, 'sell', []);
		orders = {
			...orders,
			sellOrders: sellOrders.sort( (a,b) => b.tokenPrice - a.tokenPrice )
		}

		return orders;
	}
);

// move const to the top in normal proj
const GREEN = '#25CE8F';
const RED = '#F45353';
// as we want to use decorate order in other contexts, we use this decorator to add things in this specific context
const decorateOrderBookOrder = (order, tokens) => {

	let orderType, orderTypeClass, orderFillAction;
	if(  order.tokenGive === tokens[1].address )
	{
		orderType = 'buy';
		orderTypeClass = GREEN;
		orderFillAction = 'sell';
	}
	else
	{
		orderType = 'sell';
		orderTypeClass = RED;
		orderFillAction = 'buy';
	}

	return({
		...order,
		orderType,
		orderTypeClass,
		orderFillAction
	});
}

// this is going to wrap everything in decoration of orders in the order book context
const decorateOrderBookOrders = (orders, tokens) => {

	return(
		orders.map( (order) =>
		{
			order = decorateOrder(order, tokens);
			order = decorateOrderBookOrder(order, tokens);
			return order;
		})
	);
}