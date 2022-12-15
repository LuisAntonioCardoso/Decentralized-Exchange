const config = require('../src/config.json');

// converts ETH to WEI (we use this because we assume that decimal number is the same as Eth decimal number in every case)
const Tokens = (value) => {
	return ethers.utils.parseUnits(value.toString(), 'ether');
}

// used to wait some time between instructions in order to simulate real execution
const wait = (seconds) => {
	const milliseconds = seconds * 1000;
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const random = () => { return (Math.random()*50).toString(); }

async function main() {

	// fetch deployed smart contracts in order to interact with them
	const accounts = await ethers.getSigners();

	const { chainId } = await ethers.provider.getNetwork();
	console.log(`Using chainId: ${chainId}\n`);


	// const mDAI = await ethers.getContractAt('Token', '0x5FbDB2315678afecb367f032d93F642f64180aa3');
	const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address);
	console.log(`mDAI token fetched:${mDAI.address}\n`);
	// const mBTC = await ethers.getContractAt('Token', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
	const mBTC = await ethers.getContractAt('Token', config[chainId].mBTC.address);
	console.log(`mBTC token fetched:${mBTC.address}\n`);
	//const mETH = await ethers.getContractAt('Token', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
	const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address);
	console.log(`mETH token fetched:${mETH.address}\n`);
	// const exchange = await ethers.getContractAt('Exchange', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
	const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
	console.log(`Exchange fetched:${exchange.address}\n`);

	const sender = accounts[0];
	const receiver = accounts[1];

	let transaction, result, amount;

	// user1 sends user2 100,000 mETH
	transaction = await mETH.connect(sender).transfer(receiver.address, Tokens(100000));
	await transaction.wait();
	console.log(`User1 ${sender.address} sends 100,000 mETH to user2 ${receiver.address}\n`);

	// user1 sends user2 1,000 mBTC
	transaction = await mBTC.connect(sender).transfer(receiver.address, Tokens(1000));
	await transaction.wait();
	console.log(`User1 ${sender.address} sends 100,000 mBTC to user2 ${receiver.address}\n`);

	// user1 sends user2 10,000,000 mDAI
	transaction = await mDAI.connect(sender).transfer(receiver.address, Tokens(10000000));
	await transaction.wait();
	console.log(`User1 ${sender.address} sends 100,000 mDAI to user2 ${receiver.address}\n`);

	const user1 = accounts[0];
	const user2 = accounts[1];

	// user1 approves 100,000 mDAI
	amount = Tokens(100000);
	transaction = await mDAI.connect(user1).approve(exchange.address, amount);
	await transaction.wait();
	console.log(`Approved ${amount} mDAI from user1 ${user1.address}\n`);
	// user1 deposits that amount
	transaction = await exchange.connect(user1).depositToken(mDAI.address, amount);
	await transaction.wait();
	console.log(`Deposited ${amount} mDAI from user1 ${user1.address}\n`);

	// user2 approves 100,000 mETH
	amount = Tokens(100000);
	transaction = await mETH.connect(user2).approve(exchange.address, amount);
	await transaction.wait();
	console.log(`Approved ${amount} mETH from user2 ${user2.address}\n`);
	// user1 deposits that amount
	transaction = await exchange.connect(user2).depositToken(mETH.address, amount);
	await transaction.wait();
	console.log(`Deposited ${amount} mETH from user2 ${user2.address}\n`);

/*
	let orderId;
// --------------------------------------------------------------
// Seed a Cancelled Order

	// user1 makes order
	amount = Tokens('10');
	transaction = await exchange.connect(user1).makeOrder(mDAI.address, amount, mETH.address, amount);
	result = await transaction.wait();
	console.log(`Make order from user1 ${user1.address}`);

	// user1 cancels order
	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user1).cancelOrder(orderId);
	result = await transaction.wait();
	console.log(`User1 ${user1.address} canceled order ${orderId}\n`);

	// wait 1 sec
	wait(1);
// --------------------------------------------------------------

// --------------------------------------------------------------
// Seed a Filled Order

	// user1 makes order
	amount = Tokens('10');
	transaction = await exchange.connect(user1).makeOrder(mDAI.address, amount, mETH.address, amount);
	result = await transaction.wait();
	console.log(`Make order from user1 ${user1.address}`);

	// user2 fills order
	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user2).fillOrder(orderId);
	result = await transaction.wait();
	console.log(`User2 ${user2.address} filled order ${orderId}\n`);

	// wait 1 sec
	wait(1);

	// user1 makes another order
	amount = Tokens('35');
	transaction = await exchange.connect(user1).makeOrder(mDAI.address, amount, mETH.address, amount);
	result = await transaction.wait();
	console.log(`Make order from user1 ${user1.address}`);

	// user2 fills another order
	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user2).fillOrder(orderId);
	result = await transaction.wait();
	console.log(`User2 ${user2.address} filled order ${orderId}\n`);

	// wait 1 sec
	wait(1);

	// user1 makes final order
	amount = Tokens('127');
	transaction = await exchange.connect(user1).makeOrder(mDAI.address, amount, mETH.address, amount);
	result = await transaction.wait();
	console.log(`Make order from user1 ${user1.address}`);

	// user2 fills final order
	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user2).fillOrder(orderId);
	result = await transaction.wait();
	console.log(`User2 ${user2.address} filled order ${orderId}\n`);
	// wait 1 sec
	wait(1);
// --------------------------------------------------------------

// --------------------------------------------------------------
// Seed Open Orders

	amount = Tokens(random());

	// user 1 makes 10 orders
	for(let i = 0; i <= 10; i++) {
		transaction = await exchange.connect(user1).makeOrder(mDAI.address, Tokens(random()), mETH.address, Tokens(random()));
		result = await transaction.wait();
		console.log(`Make order from user1 ${user1.address}`);
		wait(1);
	}

	// user 1 makes 10 orders
	for(let i = 0; i <= 10; i++) {
		transaction = await exchange.connect(user2).makeOrder(mETH.address, Tokens(random()), mDAI.address, Tokens(random()));
		result = await transaction.wait();
		console.log(`Make order from user2 ${user2.address}`);
		wait(1);
	}
*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

