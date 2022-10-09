import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import {  
  loadProvider, 
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange
} from '../store/interactions.js';


function App() {

  const dispatch = useDispatch();

  // function that fetches wallet connected to the browser
  const loadBlockchainData = async () => {

    // connect Ethers to blockchain
    const provider = loadProvider(dispatch); // provider is going to be our connection to the blockchain
    
    // fetch current network's chainId (hardhat:31337, kovan:42)
    const chainId = await loadNetwork(dispatch, provider);
    
    // Fetch current account and balance from metamask
    await loadAccount(dispatch, provider);
    
    // Load tokens and exchange smart contracts
    const mDAI = config[chainId].mDAI;
    const mBTC = config[chainId].mBTC;
    const mETH = config[chainId].mETH;
    const exchange = config[chainId].exchange;
    await loadTokens(dispatch, provider, [mDAI.address, mBTC.address, mETH.address]);
    await loadExchange(dispatch, provider, exchange.address);
  }

  // useEffect is what is going to be ran once the app component is loaded
  useEffect(() => {
    loadBlockchainData();
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
