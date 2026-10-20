// Simple deploy script for local development

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const AlertToken = await hre.ethers.getContractFactory("AlertToken");
  const token = await AlertToken.deploy("AlertToken", "ALRT", deployer.address);
  await token.deployed();
  console.log("AlertToken deployed to:", token.address);

  const NetworkSecurityManager = await hre.ethers.getContractFactory("NetworkSecurityManager");
  const manager = await NetworkSecurityManager.deploy(deployer.address, token.address);
  await manager.deployed();
  console.log("NetworkSecurityManager deployed to:", manager.address);

  // Grant roles and mint some tokens for the manager
  const MINTER_ROLE = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  await token.connect(deployer).grantRole(MINTER_ROLE, deployer.address);

  // Mint tokens to manager for rewards
  const mintTx = await token.connect(deployer).mint(manager.address, hre.ethers.utils.parseEther("1000"));
  await mintTx.wait();
  console.log("Minted 1000 ALRT to manager");

  console.log("Deployment complete. Owner/Admin:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
