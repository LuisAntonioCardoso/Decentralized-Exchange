import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { myOpenOrdersSelector, myFilledOrdersSelector } from '../store/selectors';

import sort from '../assets/sort.svg';

import Banner from './Banner';

const Transactions = () => {
	const [showMyOrders, setShowMyOrders] = useState(true);

	const symbols = useSelector((state) => state.tokens.symbols);

	const myOpenOrders = useSelector(myOpenOrdersSelector);
	const myFilledOrders = useSelector(myFilledOrdersSelector);

	const ordersRef = useRef(null);
	const tradesRef = useRef(null);
	const tabHandler = (event) => {
		if (event.target.className !== ordersRef.current.className) {
			ordersRef.current.className = 'tab';
			event.target.className = 'tab tab--active';
			setShowMyOrders(false);
		} else {
			tradesRef.current.className = 'tab';
			event.target.className = 'tab tab--active';
			setShowMyOrders(true);
		}
	};

	return (
		<div className='component exchange__transactions'>
			{showMyOrders ? (
				<div>
					<div className='component__header flex-between'>
						<h2>My Orders</h2>

						<div className='tabs'>
							<button
								onClick={tabHandler}
								ref={ordersRef}
								className='tab tab--active'>
								Orders
							</button>
							<button
								onClick={tabHandler}
								ref={tradesRef}
								className='tab'>
								Trades
							</button>
						</div>
					</div>

					{!myOpenOrders || myOpenOrders.length === 0 ? (
						<Banner text='No Open Orders' />
					) : (
						<table>
							<thead>
								<tr>
									<th>
										{symbols && symbols[0]}
										<img
											src={sort}
											alt='Sort'
										/>
									</th>
									<th>
										{symbols && symbols[0]}/{symbols && symbols[1]}
										<img
											src={sort}
											alt='Sort'
										/>
									</th>
									<th></th>
								</tr>
							</thead>

							<tbody>
								{myOpenOrders &&
									myOpenOrders.map((order, index) => {
										return (
											<tr key={index}>
												<td style={{ color: `${order.orderTypeClass}` }}>
													{order.token0Amount}
												</td>
												<td>{order.tokenPrice}</td>
												<td>Placeholder</td>
											</tr>
										);
									})}
							</tbody>
						</table>
					)}
				</div>
			) : (
				<div>
					<div className='component__header flex-between'>
						<h2>My Transactions</h2>

						<div className='tabs'>
							<button
								onClick={tabHandler}
								ref={ordersRef}
								className='tab tab--active'>
								Orders
							</button>
							<button
								onClick={tabHandler}
								ref={tradesRef}
								className='tab'>
								Trades
							</button>
						</div>
					</div>

					{!myFilledOrders || myFilledOrders.length === 0 ? (
						<Banner text='No Transactions' />
					) : (
						<table>
							<thead>
								<tr>
									<th>
										Time
										<img
											src={sort}
											alt='Sort'
										/>
									</th>
									<th>
										{symbols && symbols[0]}
										<img
											src={sort}
											alt='Sort'
										/>
									</th>
									<th>
										{symbols && symbols[0]}/{symbols && symbols[1]}
										<img
											src={sort}
											alt='Sort'
										/>
									</th>
								</tr>
							</thead>

							<tbody>
								{myFilledOrders &&
									myFilledOrders.map((order, index) => {
										return (
											<tr key={index}>
												<td>{order.formattedTimestamp}</td>
												<td style={{ color: `${order.orderTypeClass}` }}>
													{order.orderSign}
													{order.token0Amount}
												</td>
												<td>{order.tokenPrice}</td>
											</tr>
										);
									})}
							</tbody>
						</table>
					)}
				</div>
			)}
		</div>
	);
};

export default Transactions;
