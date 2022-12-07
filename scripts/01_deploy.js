
// needed if you want to use the command: node run scripts/....js    instead of the command: npx hardhat run scripts/....js
// the 1st way  doesn't need hardhat installed in the project, and uses hardhat as a library
const hre = require('hardhat'); 
//or 
const { ethers } = require('hardhat');

async function main() {

    console.log('Preparing deployment...\n');

    // Fetch contract to deploy
    const Token = await ethers.getContractFactory('Token');
    const Exchange = await ethers.getContractFactory('Exchange');

    const accounts = await ethers.getSigners();

    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`);

    // Deploy contract
    const mDAI = await Token.deploy('mock dai', 'mDAI', '100000000');
    await mDAI.deployed();
    console.log(`mDAI deployed to: ${mDAI.address}`);

    const mBTC = await Token.deploy('mock btc', 'mBTC', '100000000');
    await mBTC.deployed();
    console.log(`mBTC deployed to: ${mBTC.address}`);

    const mETH = await Token.deploy('mock eth', 'mETH', '100000000');
    await mETH.deployed();
    console.log(`mETH deployed to: ${mETH.address}`);

    const exchange = await Exchange.deploy(accounts[1].address, 10);
    await exchange.deployed();
    console.log(`exchange deployed to: ${exchange.address}`);
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

