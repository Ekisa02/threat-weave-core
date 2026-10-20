const hre = require("hardhat");

async function main() {
  const [deployer, oracleAccount, operatorAccount, responder] = await hre.ethers.getSigners();

  // Deploy fresh instances for demonstration
  const AlertToken = await hre.ethers.getContractFactory("AlertToken");
  const token = await AlertToken.deploy("AlertToken", "ALRT", deployer.address);
  await token.deployed();

  const NetworkSecurityManager = await hre.ethers.getContractFactory("NetworkSecurityManager");
  const manager = await NetworkSecurityManager.deploy(deployer.address, token.address);
  await manager.deployed();

  const AIOracleMock = await hre.ethers.getContractFactory("AIOracleMock");
  const oracle = await AIOracleMock.deploy(deployer.address, manager.address);
  await oracle.deployed();

  const ORACLE_ROLE = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("ORACLE_ROLE"));
  const OPERATOR_ROLE = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("OPERATOR_ROLE"));
  const MINTER_ROLE = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("MINTER_ROLE"));

  // Grant roles
  await manager.connect(deployer).grantRole(OPERATOR_ROLE, operatorAccount.address);
  await oracle.connect(deployer).grantRole(ORACLE_ROLE, oracleAccount.address);
  await token.connect(deployer).grantRole(MINTER_ROLE, deployer.address);

  // Fund manager
  await token.connect(deployer).mint(manager.address, hre.ethers.utils.parseEther("500"));

  // Operator creates a rule
  await manager.connect(operatorAccount).createRule("Suspicious outbound traffic from subnet 10.0.0.0/24", 3);

  // Oracle publishes an alert
  // Using oracleAccount to call publishAlert
  const published = await oracle.connect(deployer).grantRole(ORACLE_ROLE, oracleAccount.address);
  await published.wait();

  const tx = await oracle.connect(oracleAccount).publishAlert(1, "QmExampleEvidenceHash", 3, 87);
  const receipt = await tx.wait();
  console.log("Alert published, tx hash:", receipt.transactionHash);

  // Operator handles it and pays a reward
  await manager.connect(operatorAccount).handleAlert(1, responder.address, hre.ethers.utils.parseEther("1"));
  console.log("Alert handled and 1 ALRT reward paid to responder", responder.address);
}

main().catch((err) => { console.error(err); process.exit(1); });
