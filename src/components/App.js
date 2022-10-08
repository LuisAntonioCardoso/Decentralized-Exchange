import { useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json';
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';
import './../App.css';

function App() {

  // function that fetches wallet connected to the browser
  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    console.log(accounts[0]);

    // Connect ethers to the blockchain
    // not needed when using ethers from hardhat because it's different library
    const provider = new ethers.providers.Web3Provider(window.ethereum); // provider is going to be our connection to the blockchain
    const network = await provider.getNetwork();
    console.log(network);
 
    // when can use {<property>} to get only the properties needed 
    const {chainId} = network;
    console.log(chainId);

    // token smart contract
    const token = new ethers.Contract(config[chainId].mDAI.address,TOKEN_ABI,provider);
    console.log(token.address);
    const symbol = await token.symbol();
    console.log(symbol);

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
