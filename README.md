# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# This is the capstone project

Config Notes:
- in the src/config.jason file:
	- the default id of the hardhat chain is 31337
	- the values for the addresses are the ones that should be attributed to the smartcontracts by the node when script/01_deploy.js is run
	- if the values change, the src/config.jason needs to be updated or the scripts using those values changed

