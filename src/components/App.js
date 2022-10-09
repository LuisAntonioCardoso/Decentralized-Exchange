import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import {  
  loadProvider, 
  loadNetwork,
  loadAccount,
  loadToken
} from '../store/interactions.js';


function App() {

  const dispatch = useDispatch();

  // function that fetches wallet connected to the browser
  const loadBlockchainData = async () => {
    
    await loadAccount(dispatch);
    const provider = loadProvider(dispatch); // provider is going to be our connection to the blockchain
    const chainId = await loadNetwork(dispatch, provider); 

    await loadToken(dispatch, provider, config[chainId].mDAI.address);

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
