const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokenToDecimal = (value) => {
  // converts ETH to WEI (we use this because decimal number is the same as Eth decimal number)
  return ethers.utils.parseUnits(value.toString(), 'ether');     
}

describe('Token', () => {

  // we put the variable here so that it can be used by all the tests
  let token, 
      accounts,
      deployer,
      receiver;

  // we need to indicate that we are using async functions 
  beforeEach( async() => {
    // Import teh contract
    const Token = await ethers.getContractFactory('Token');
    // deploy contract
    token = await Token.deploy('My Token', 'MTK', '1000');
    // get accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
  });

  describe('Deployment', () => {
    const name = 'My Token';
    const symbol = 'MTK';
    const decimals = 18;
    const totalSupply = tokenToDecimal(1000);
    
    it('has correct name', async () => {
      expect(await token.name()).to.equal(name);
    })

    it('has correct symbol', async () => { 
      expect(await token.symbol()).to.equal(symbol);
    })

    it('has correct decimals', async () => { 
      expect(await token.decimals()).to.equal(decimals);
    })

    it('has correct total supply', async () => { 
      expect(await token.totalSupply()).to.equal(totalSupply);
    })

    it('assigns total supply to deployer', async () => { 
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    })
  });

  describe('Sending Token', async () => {

    let amount,
        transaction,
        result;
    
    describe('success', () => {

      beforeEach( async () => {
        amount = tokenToDecimal('100');
        transaction = await token.connect(deployer).transfer(receiver.address, amount); // connect sender to sign the transaction and do the transaction
        result = await transaction.wait();  // wait for the transaction to get included in a block
      });
  
      it('accounts have correct balances', async () => {
  
        expect(await token.balanceOf(deployer.address)).to.equal(tokenToDecimal('900'));
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
  
      });
  
      it('emits a transfer event', async () => {
        const event = result.events[0]; 
        expect(event.event).to.equal('Transfer');
        expect(event.args.from).to.equal(deployer.address);
        expect(event.args.to).to.equal(receiver.address);
        expect(event.args.value).to.equal(amount);
      });
    });

    describe('failure', () => {

      it('rejects insufficient balance', async () => {
  
        const invalidAmount = tokenToDecimal('10000');
        await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;
      });

      it('rejects invalid recipient', async () => {
  
        const amount = tokenToDecimal('100');
        await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted;
      });
    });

  });
});
