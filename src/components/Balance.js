import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import dapp from '../assets/dapp.svg';
import eth from '../assets/eth.svg';

import { 
	loadBalances, 
	transferTokens
} from '../store/interactions';

const Balance = () => {

	const symbols = useSelector( state => state.tokens.symbols );


	const provider = useSelector( state => state.provider.connection );


	const dispatch = useDispatch();
	const exchange = useSelector( state => state.exchange.contract );
	const account = useSelector( state => state.provider.account );
	const tokens = useSelector( state => state.tokens.contracts );


	const tokenBalances = useSelector( state => state.tokens.balances );
	const exchangeBalances = useSelector( state => state.exchange.balances );


	const transferInProgress = useSelector( state => state.exchange.transferInProgress );

	const [token1TransferAmount, setToken1TransferAmount] = useState(0);
	const amountToken1Handler = async (event) => {

		setToken1TransferAmount(event.target.value);
	};
	const depositToken1Handler = async (event) => {

		event.preventDefault(); // prevents the page from refreshing on execution
		transferTokens(dispatch, provider, exchange, 'Deposit', tokens[0], token1TransferAmount);
		setToken1TransferAmount(0);
	};


	const [token2TransferAmount, setToken2TransferAmount] = useState(0);
	const amountToken2Handler = async (event) => {

		setToken2TransferAmount(event.target.value);
	};
	const depositToken2Handler = async (event) => {

		event.preventDefault(); // prevents the page from refreshing on execution
		transferTokens(dispatch, provider, exchange, 'Deposit', tokens[1], token2TransferAmount);
		setToken2TransferAmount(0);
	};


	const depositRef = useRef(null); // creates a reference that can be adopter by HTML elements
	const withdrawRef = useRef(null);
	const tabHandler = (event) => {

		if( event.target.className !== depositRef.current.className)
		{
			event.target.className = 'tab tab--active';
			depositRef.current.className = 'tab';
			setIsDeposit(false);
		}
		else
		{
			event.target.className = 'tab tab--active';
			withdrawRef.current.className = 'tab';
			setIsDeposit(true);
		}
	}

	const [isDeposit, setIsDeposit] = useState(true);

	useEffect( () => {

		if(exchange && tokens[0] && tokens[1] && account) // verify if everything is loaded first
			loadBalances( dispatch, exchange, account, tokens);
	}, [exchange, tokens, account, transferInProgress] ); // run the useEffect when any of this variables change

	return (
		<div className='component exchange__transfers'>
			<div className='component__header flex-between'>

		  		<h2>Balance</h2>

		  		<div className='tabs'>
					<button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
					<button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
		  		</div>
			</div>
  
			{/* Deposit/Withdraw Component 1 (mDAI) */}
  
			<div className='exchange__transfers--form'>
				<div className='flex-between'>
					<p>
						<small>Token</small>
						<br/>
						<img src={dapp} alt="Token logo"/>
						{ symbols ?
							symbols[0]
						:
							null
						}
					</p>

					<p>
						<small>Wallet</small>
						<br/>
						{tokenBalances && tokenBalances[0]}
					</p>

					<p>
						<small>Exchange</small>
						<br/>
						{exchangeBalances && exchangeBalances[0]}
					</p>
				</div>
	
				<form onSubmit={depositToken1Handler}>
					<label htmlFor="token0">
						{ symbols ?
							symbols[0] 
						:
							null
						} Amount
					</label>
					<input 
						type="text"
						id='token0'
						placeholder='0.0000'
						value= { token1TransferAmount === 0 ? '' : token1TransferAmount }
						onChange={amountToken1Handler}/>
					<button className='button' type='submit'>
						{ isDeposit ?
							<span>Deposit</span>
						:		
							<span>Withdraw</span>
						}
					</button>
				</form>
			</div>
  
			<hr />
  
			{/* Deposit/Withdraw Component 2 (mETH) */}
		
			<div className='exchange__transfers--form'>
				<div className='flex-between'>
					<p>
						<small>Token</small>
						<br/>
						<img src={eth} alt="Token logo"/>
						{ symbols ?
							symbols[1]
						:
							null
						}
					</p>

					<p>
						<small>Wallet</small>
						<br/>
						{tokenBalances && tokenBalances[1]}
					</p>

					<p>
						<small>Exchange</small>
						<br/>
						{exchangeBalances && exchangeBalances[1]}
					</p>
				</div>
	
				<form onSubmit={depositToken2Handler}>
					<label htmlFor="token1">
						{ symbols ?
							symbols[1] 
						:
							null
						} Amount
					</label>
					<input 
						type="text" 
						id='token1' 
						placeholder='0.0000'
						value= { token2TransferAmount === 0 ? '' : token2TransferAmount } 
						onChange={amountToken2Handler}/>
					<button className='button' type='submit'>
						{ isDeposit ?
							<span>Deposit</span>
						:		
							<span>Withdraw</span>
						}
					</button>
				</form>
			</div>
  
			<hr />
		</div>
	);
  }
  
  export default Balance;
