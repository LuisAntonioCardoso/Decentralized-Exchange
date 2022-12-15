import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { makeOrder } from '../store/interactions';

const Order = () => {

	const dispatch = useDispatch();
	const provider = useSelector( state => state.provider.connection);
	const exchange = useSelector( state => state.exchange.contract);
	const tokens = useSelector( state => state.tokens.contracts);

	const [isBuy, setIsBuy] = useState(true);
	const [amount, setAmount] = useState(0);
	const [price, setPrice] = useState(0);

	const transactionHandler = async (event) => {

		event.preventDefault(); // prevents the page from refreshing on execution
		makeOrder(dispatch, provider, exchange, isBuy, tokens, {amount, price});
		setAmount(0);
		setPrice(0);
	}

	const buyRef = useRef(null);
	const sellRef = useRef(null);

	const tabHandler = (event) => {

		if( event.target.className !== buyRef.current.className )
		{
			event.target.className = 'tab tab--active';
			buyRef.current.className = 'tab';
			setIsBuy(false);
		}
		else
		{
			event.target.className = 'tab tab--active';
			sellRef.current.className = 'tab';
			setIsBuy(true);
		}
	}

	return (
		<div className="component exchange__orders">
			<div className='component__header flex-between'>
				<h2>New Order</h2>

				<div className='tabs'>
					<button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
					<button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
				</div>
			</div>

			<form onSubmit={transactionHandler}>

				{ isBuy ?
					<label htmlFor="amount">Buy Amount</label>
				:
					<label htmlFor="amount">Sell Amount</label>
				}

				<input
					type="text"
					id='amount'
					value= { amount === 0 ? '' : amount }
					onChange={ (event) => setAmount(event.target.value) }
					placeholder='0.0000' />

				{ isBuy ?
					<label htmlFor="price">Buy Price</label>
				:
					<label htmlFor="price">Sell Price</label>
				}

				<input
					type="text"
					id='price'
					value= { price === 0 ? '' : price }
					onChange={ (event) => setPrice(event.target.value) }
					placeholder='0.0000'/>

				<button className='button button--filled' type='submit'>
					{ isBuy ?
						<span>Buy Order</span>
					:
						<span>Sell Order</span>
					}
				</button>
			</form>
		</div>
	);
  }

  export default Order;