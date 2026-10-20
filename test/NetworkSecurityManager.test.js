const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NetworkSecurityManager", function () {
  let AlertToken, NetworkSecurityManager, AIOracleMock;
  let token, manager, oracleMock;
  let admin, oracleAccount, operator, responder, other;

  beforeEach(async function () {
    [admin, oracleAccount, operator, responder, other] = await ethers.getSigners();

    AlertToken = await ethers.getContractFactory("AlertToken");
    token = await AlertToken.deploy("AlertToken", "ALRT", admin.address);
    await token.deployed();

    NetworkSecurityManager = await ethers.getContractFactory("NetworkSecurityManager");
    manager = await NetworkSecurityManager.deploy(admin.address, token.address);
    await manager.deployed();

    AIOracleMock = await ethers.getContractFactory("AIOracleMock");
    oracleMock = await AIOracleMock.deploy(admin.address, manager.address);
    await oracleMock.deployed();

    // Roles
    const ORACLE_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE"));
    const OPERATOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("OPERATOR_ROLE"));
    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));

    // grant roles
    await manager.connect(admin).grantRole(OPERATOR_ROLE, operator.address);
    await oracleMock.connect(admin).grantRole(ORACLE_ROLE, oracleAccount.address);
    await token.connect(admin).grantRole(MINTER_ROLE, admin.address);

    // Fund manager with tokens
    await token.connect(admin).mint(manager.address, ethers.utils.parseEther("100"));
  });

  it("allows operator to create a rule and oracle to submit an alert and operator to handle it with reward", async function () {
    // Operator creates a rule
    await manager.connect(operator).createRule("Test rule: brute force pattern", 4);
    const rule = await manager.rules(1);
    expect(rule.id).to.equal(1);
    expect(rule.active).to.equal(true);

    // Oracle publishes an alert via the oracle mock
    // First ensure oracle mock has ORACLE_ROLE to call manager
    await manager.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE")), oracleMock.address);

    // Grant ORACLE_ROLE to the oracleAccount within oracleMock
    await oracleMock.connect(admin).grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE")), oracleAccount.address);

    // Publish alert
    await expect(oracleMock.connect(oracleAccount).publishAlert(1, "QmTestEvidence", 4, 92))
      .to.emit(manager, "AlertSubmitted");

    const alert = await manager.alerts(1);
    expect(alert.id).to.equal(1);
    expect(alert.ruleId).to.equal(1);
    expect(alert.handled).to.equal(false);

    // Operator handles alert and pays 1 ALRT reward
    await expect(manager.connect(operator).handleAlert(1, responder.address, ethers.utils.parseEther("1")))
      .to.emit(manager, "AlertHandled");

    // Responder should have received tokens
    const bal = await token.balanceOf(responder.address);
    expect(bal).to.equal(ethers.utils.parseEther("1"));

    const alertAfter = await manager.alerts(1);
    expect(alertAfter.handled).to.equal(true);
  });

  it("prevents non-operators from creating rules", async function () {
    await expect(manager.connect(other).createRule("X", 1)).to.be.reverted;
  });
});
