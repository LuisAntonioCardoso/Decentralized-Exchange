import { useSelector, useDispatch } from 'react-redux';

import config from '../config.json';

import { loadTokens } from '../store/interactions';

const Markets = () => {

	const dispatch = useDispatch();	
	const provider = useSelector(state => state.provider.connection);
	const chainId = useSelector(state => state.provider.chainId);

	const marketHandler = async (event) => {
		loadTokens(dispatch, provider, (event.target.value).split(','));
	};

	return(
		<div className="component exchange__markets">
			<div className="component__header">
				<h2>Select Market</h2>
			</div>

			{ chainId && config[chainId] ?
				(<select name="markets" id="markets" onChange={marketHandler}>
					<option value={`${config[chainId].mDAI.address},${config[chainId].mETH.address}`}>mDAI / mETH</option>
					<option value={`${config[chainId].mDAI.address},${config[chainId].mBTC.address}`}>mDAI / mBTC</option>						
				</select>)
			: 
				(<div>
					<p>Not Deployed to Network</p>
				</div>)
			}

			<hr/>
		</div>
	)
}

export default Markets;
