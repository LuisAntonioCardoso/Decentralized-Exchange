const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokenToDecimal = (value) => {
  // converts ETH to WEI (we use this because decimal number is the same as Eth decimal number)
  return ethers.utils.parseUnits(value.toString(), 'ether');     
}

describe('Token', () => {

  // we put the variable here so that it can be used by all the tests
  let token;

  beforeEach( async() => {
    // Import teh contract
    const Token = await ethers.getContractFactory('Token');
    // deploy contract
    token = await Token.deploy('My Token', 'MTK', '1000');
  })

  describe('deployment', () => {
    const name = 'My Token';
    const symbol = 'MTK';
    const decimals = 18;
    const totalSupply = tokenToDecimal(1000);

    // we need to indicate that we are using async functions 
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
  })

});
