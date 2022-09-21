const { ethers } = require("hardhat");
const { expect } = require("chai");

const Tokens = (value) => {
	// converts ETH to WEI (we use this because decimal number is the same as Eth decimal number)
	return ethers.utils.parseUnits(value.toString(), 'ether');     
}

describe('Exchange', () => {

  	let deployer,
  		feeAccount,
		exchange,
		token1,
		token2;

	const feeRate = 10;

	beforeEach( async() => {

		const Exchange = await ethers.getContractFactory('Exchange');
		const Token = await ethers.getContractFactory('Token');

		accounts = await ethers.getSigners();
		deployer = accounts[0];
		feeAccount = accounts[1];
		user1 = accounts[2];
		user2 = accounts[3];

		exchange = await Exchange.deploy(feeAccount.address, feeRate);
		token1 = await Token.deploy('Token1', 'T1', 1000);
		token2 = await Token.deploy('Token2', 'T2', 1000);

		let transaction = await token1.connect(deployer).transfer(user1.address, Tokens(100));
		transaction.wait();
		transaction = await token2.connect(deployer).transfer(user2.address, 100);
		transaction.wait();
	});

	describe('Deployment', () => {
    
		it('it tracks the fee account', async () => {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address);
		});

		it('it tracks the exchange fee rate', async () => {
			expect(await exchange.feeRate()).to.equal(feeRate);
		});
  	});

	describe('Deposit Tokens', () => {

		let amount,
			transaction,
			result;

		describe('Success', () => {

			beforeEach( async () => {
			
				amount = Tokens(10);
				// approve token
				transaction = await token1.connect(user1).approve(exchange.address, amount);
				result = await transaction.wait();
				// deposit tokens
				transaction = await exchange.connect(user1).depositToken(token1.address, amount);
				result = await transaction.wait();
			});

			it('tracks token deposit', async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(amount);
			});

			it('balances are correct', async () => {
				expect(await exchange.tokenBalanceOf(token1.address, user1.address)).to.equal(amount);
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
			});

			it('emits deposit event', async () => {
				const event = result.events[1];
				expect(event.event).to.equal('Deposit');
				expect(event.args.token).to.equal(token1.address);
				expect(event.args.user).to.equal(user1.address);
				expect(event.args.amount).to.equal(amount);
				expect(event.args.balance).to.equal(amount);
			});
		});

		describe('Failure', () => {

			it('fails when no tokens are approved', async () => {

				amount = Tokens(10);

				await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted;				
			});

			it('fails when not enough tokens are not approved', async () => {

				amount = Tokens(10);
				let smallAmount = Tokens(1);

				transaction = await token1.connect(user1).approve(exchange.address, smallAmount);
				result = await transaction.wait();

				await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted;				
			});
		});
	});

	describe('Withdraw Tokens', () => {

		let depositedAmount,
			transaction,
			result,
			withdrawAmount;

		beforeEach( async () => {
		
			// deposit tokens before withdraw
			depositedAmount = Tokens(10);
			// approve token
			transaction = await token1.connect(user1).approve(exchange.address, depositedAmount);
			result = await transaction.wait();
			// deposit tokens
			transaction = await exchange.connect(user1).depositToken(token1.address, depositedAmount);
			result = await transaction.wait();
		});

		describe('Success', () => {

			beforeEach( async () => {
			
				withdrawAmount = Tokens(5);
				// withdraw tokens
				transaction = await exchange.connect(user1).withdrawToken(token1.address, withdrawAmount);
				result = await transaction.wait();
			});

			it('tracks token transfer', async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(withdrawAmount);
			});

			it('balances are correct', async () => {
				expect(await exchange.tokenBalanceOf(token1.address, user1.address)).to.equal(withdrawAmount);
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(withdrawAmount);
			});

			it('emits deposit event', async () => {
				const event = result.events[1];
				expect(event.event).to.equal('Withdraw');
				expect(event.args.token).to.equal(token1.address);
				expect(event.args.user).to.equal(user1.address);
				expect(event.args.amount).to.equal(withdrawAmount);
				expect(event.args.balance).to.equal(withdrawAmount);
			});
		});

		describe('Failure', () => {

			it('fails withdraw amount is smaller then deposit amount', async () => {

				withdrawAmount = Tokens(15);

				await expect(exchange.connect(user1).withdrawToken(token1.address, withdrawAmount)).to.be.reverted;				
			});
		});
	});

	// basic unit test on the function level 
	describe('Checking Balances', () => {

		let amount,
			transaction,
			result;

		beforeEach( async () => {
		
			amount = Tokens(1);
			// approve token
			transaction = await token1.connect(user1).approve(exchange.address, amount);
			result = await transaction.wait();
			// deposit tokens
			transaction = await exchange.connect(user1).depositToken(token1.address, amount);
			result = await transaction.wait();
		});

		it('returns user balance', async () => {
			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
		});
	});
});
