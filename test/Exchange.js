const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokenToDecimal = (value) => {
	// converts ETH to WEI (we use this because decimal number is the same as Eth decimal number)
	return ethers.utils.parseUnits(value.toString(), 'ether');     
}

describe('Exchange', () => {

  	let deployer,
  		feeAccount,
		exchange;

	const feeRate = 10;

	beforeEach( async() => {

		const Exchange = await ethers.getContractFactory('Exchange');

		accounts = await ethers.getSigners();
		deployer = accounts[0];
		feeAccount = accounts[1];

		exchange = await Exchange.deploy(feeAccount.address, feeRate);
	});

	describe('Deployment', () => {
    
		it('it tracks the fee account', async () => {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address);
		});

		it('it tracks the exchange fee rate', async () => {
			expect(await exchange.feeRate()).to.equal(feeRate);
		});
  	});
});
