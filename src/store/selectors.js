import { createSelector } from 'reselect';
import { get, groupBy, reject, maxBy, minBy } from 'lodash';
import moment from 'moment';
import { ethers } from 'ethers';

const tokens = (state) => get(state, 'tokens.contracts');
const account = (state) => get(state, 'provider.account');

const cancelledOrders = (state) => get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = (state) => get(state, 'exchange.filledOrders.data', []);
const allOrders = (state) => get(state, 'exchange.allOrders.data', []);

const openOrders = (state) => {
	const cancelled = cancelledOrders(state);
	const filled = filledOrders(state);
	const all = allOrders(state);

	const openOrders = reject(all, (order) => {
		const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString()); // verify if the order in all has the same id of one in cancelled
		const orderFilled = filled.some((o) => o.id.toString() === order.id.toString()); // verify if the order in all has the same id of one in filled
		return orderCancelled || orderFilled; // if the order exists in cancelled or in filled, then proceed to reject
	});

	return openOrders;
};

const decorateOrder = (order, tokens) => {
	let token0Amount, token1Amount;

	if (order.tokenGive === tokens[1].address) {
		token0Amount = order.amountGive;
		token1Amount = order.amountGet;
	} else {
		token0Amount = order.amountGet;
		token1Amount = order.amountGive;
	}

	// calculate price with 5 decimal places
	const precision = 100000;
	let tokenPrice = token1Amount / token0Amount;
	tokenPrice = Math.round(tokenPrice * precision) / precision; // this is what is going to round things

	return {
		...order,
		token0Amount: Math.round(ethers.utils.formatUnits(token0Amount, 'ether') * 10) / 10,
		token1Amount: Math.round(ethers.utils.formatUnits(token1Amount, 'ether') * 10) / 10,
		tokenPrice, // if the name of the attribute returned is the same as the variable that contains the data, you don't need to write everything ("tokenPrice : tokenPrice")
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
	};
};

// ----------------------------------------------------------------
// MY OPEN ORDERS

export const myOpenOrdersSelector = createSelector(
	account,
	tokens,
	openOrders,
	(account, tokens, orders) => {
		if (!tokens[0] || !tokens[1]) return;

		// filter out the orders made by other users
		orders = orders.filter((order) => order.user === account);

		// filter orders by selectedTokens
		orders = orders.filter(
			(order) => order.tokenGet === tokens[0].address || order.tokenGet === tokens[1].address
		);
		orders = orders.filter(
			(order) =>
				order.tokenGive === tokens[0].address || order.tokenGive === tokens[1].address
		);

		orders = decorateMyOpenOrders(orders, tokens);

		// sort orders by descending date
		orders = orders.sort((a, b) => b.timestamp - a.timestamp);

		return orders;
	}
);

const decorateMyOpenOrders = (orders, tokens) => {
	return orders.map((order) => {
		order = decorateOrder(order, tokens);
		order = decorateMyOpenOrder(order, tokens);
		return order;
	});
};

const decorateMyOpenOrder = (order, tokens) => {
	const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';
	const orderTypeClass = orderType === 'buy' ? 'GREEN' : 'RED';

	return {
		...order,
		orderType,
		orderTypeClass
	};
};

// ----------------------------------------------------------------
// MY FILLED ORDERS

export const myFilledOrdersSelector = createSelector(
	account,
	tokens,
	filledOrders,
	(account, tokens, orders) => {
		if (!tokens[0] || !tokens[1]) return;

		// filter out the orders made by other users
		orders = orders.filter(
			(order) => order.orderTaker === account || order.orderCreator === account
		);

		// filter orders by selectedTokens
		orders = orders.filter(
			(order) => order.tokenGet === tokens[0].address || order.tokenGet === tokens[1].address
		);
		orders = orders.filter(
			(order) =>
				order.tokenGive === tokens[0].address || order.tokenGive === tokens[1].address
		);

		// sort orders by descending date
		orders = orders.sort((a, b) => b.timestamp - a.timestamp);

		orders = decorateMyFilledOrders(orders, account, tokens);

		return orders;
	}
);

const decorateMyFilledOrders = (orders, account, tokens) => {
	return orders.map((order) => {
		order = decorateOrder(order, tokens);
		order = decorateMyFilledOrder(order, account, tokens);
		return order;
	});
};

const decorateMyFilledOrder = (order, account, tokens) => {
	const myOrder = order.creator === account;

	let orderType;
	if (myOrder) orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';
	else orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy';

	return {
		...order,
		orderType,
		orderTypeClass: orderType === 'buy' ? 'GREEN' : 'RED',
		orderSign: orderType === 'buy' ? '+' : '-'
	};
};

// ----------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
	if (!tokens[0] || !tokens[1]) return;

	// filter orders by selectedTokens
	orders = orders.filter(
		(order) => order.tokenGet === tokens[0].address || order.tokenGet === tokens[1].address
	);
	orders = orders.filter(
		(order) => order.tokenGive === tokens[0].address || order.tokenGive === tokens[1].address
	);

	// sort orders by ascending time
	orders = orders.sort((a, b) => a.timestamp - b.timestamp);

	// decorate orders
	orders = decorateFilledOrders(orders, tokens);

	// sort orders by descending time
	orders = orders.sort((a, b) => b.timestamp - a.timestamp);

	return orders;
});

const decorateFilledOrders = (orders, tokens) => {
	let previousOrder = orders[0];

	return (orders = orders.map((order) => {
		order = decorateOrder(order, tokens);
		order = decorateFilledOrder(order, previousOrder);
		previousOrder = order; // track this order to use in next iteration

		return order;
	}));
};

const decorateFilledOrder = (order, previousOrder) => {
	return {
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, previousOrder.tokenPrice)
	};
};

const tokenPriceClass = (tokenPrice, previousOrderPrice) => {
	if (previousOrderPrice <= tokenPrice) return GREEN;
	else return RED;
};

// ----------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {
	if (!tokens[0] || !tokens[1]) return;

	// filter orders by selectedTokens
	orders = orders.filter(
		(order) => order.tokenGet === tokens[0].address || order.tokenGet === tokens[1].address
	);
	orders = orders.filter(
		(order) => order.tokenGive === tokens[0].address || order.tokenGive === tokens[1].address
	);

	// decorate orders (by going through everyone individually)
	// decoration with the purpose of make it easy to access the information about the order later
	orders = decorateOrderBookOrders(orders, tokens);

	// group order by order type
	orders = groupBy(orders, 'orderType');

	// sort buy order by price
	const buyOrders = get(orders, 'buy', []);
	orders = {
		...orders,
		buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
	};
	// sort sell order by price
	const sellOrders = get(orders, 'sell', []);
	orders = {
		...orders,
		sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
	};

	return orders;
});

// move const to the top in normal proj
const GREEN = '#25CE8F';
const RED = '#F45353';
// as we want to use decorate order in other contexts, we use this decorator to add things in this specific context
const decorateOrderBookOrder = (order, tokens) => {
	let orderType, orderTypeClass, orderFillAction;
	if (order.tokenGive === tokens[1].address) {
		orderType = 'buy';
		orderTypeClass = GREEN;
		orderFillAction = 'sell';
	} else {
		orderType = 'sell';
		orderTypeClass = RED;
		orderFillAction = 'buy';
	}

	return {
		...order,
		orderType,
		orderTypeClass,
		orderFillAction
	};
};

// this is going to wrap everything in decoration of orders in the order book context
const decorateOrderBookOrders = (orders, tokens) => {
	return orders.map((order) => {
		order = decorateOrder(order, tokens);
		order = decorateOrderBookOrder(order, tokens);
		return order;
	});
};

// ----------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
	if (!tokens[0] || !tokens[1]) return;

	orders = orders.filter(
		(order) => order.tokenGet === tokens[0].address || order.tokenGet === tokens[1].address
	);
	orders = orders.filter(
		(order) => order.tokenGive === tokens[0].address || order.tokenGive === tokens[1].address
	);

	// sort orders by time
	orders = orders.sort((a, b) => a.timestamp - b.timestamp);

	// decorate orders
	orders = orders.map((order) => decorateOrder(order, tokens));

	// get last 2 orders
	let lastOrder, secondLastOrder;
	[secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);

	const lastPrice = get(lastOrder, 'tokenPrice', 0); // if lastOrder is null return 0, else return tokenPrice property
	const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0); // if lastOrder is null return 0, else return tokenPrice property

	return {
		lastPrice,
		lastPriceChange: lastPrice >= secondLastPrice ? '+' : '-',
		series: [
			{
				data: buildGraphData(orders)
			}
		]
	};
});

const buildGraphData = (orders) => {
	// as we don't want to group by every individual time(simple attribute), we need to use a function
	// we use the moment.unix to group time intervals(hour, day, month) with .startOf()
	orders = groupBy(orders, (order) => moment.unix(order.timestamp).startOf('hour').format());

	const hours = Object.keys(orders);

	const graphData = hours.map((hour) => {
		// fetch all order from current hour
		const group = orders[hour];

		//calculate price values: open, close, high, low
		const open = group[0]; // first order
		const high = maxBy(group, 'tokenPrice'); // highest price
		const low = minBy(group, 'tokenPrice'); // lowest price
		const close = group[group.length - 1]; // last order

		return {
			x: new Date(hour), // value for the time
			y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice] // candlestick data (open, close, high, low)
		};
	});

	return graphData;
};
