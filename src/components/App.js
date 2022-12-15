import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents
} from '../store/interactions.js';

import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';

function App() {

  const dispatch = useDispatch();

  /**
   * function where we gather information about the blockchain
   * this includes:
   *    - the node we are using to interact with the blockchain (provider)
   *    - the blockchain ID
   *    - connect the browser wallet
   *    - the smart contract addresses
   */
  const loadBlockchainData = async () => {

    // connect Ethers to blockchain
    const provider = loadProvider(dispatch); // provider is going to be our connection to the blockchain

    // fetch current network's chainId (hardhat:31337, kovan:42)
    const chainId = await loadNetwork(dispatch, provider);

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    // if the account in metamask change, then load new account
    window.ethereum.on('accountsChanged', () => {
      // TODO: we should check if it was previously loaded
      // Fetch current account and balance from metamask
      loadAccount(dispatch, provider);
    });

    // Load tokens and exchange smart contracts
    const mDAI = config[chainId].mDAI;
    const mETH = config[chainId].mETH;
    await loadTokens(dispatch, provider, [mDAI.address, mETH.address]);

    const exchangeConfig = config[chainId].exchange;
    const exchange = await loadExchange(dispatch, provider, exchangeConfig.address);

    subscribeToEvents(dispatch, exchange);
  }

  // useEffect is what is going to run once the app component is loaded
  useEffect(() => {
    loadBlockchainData();
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets/>

          <Balance/>

          <Order/>

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
