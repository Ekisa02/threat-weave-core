// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface INetworkSecurityManager {
    function submitAlert(uint256 ruleId, string calldata evidenceHash, uint8 severity, uint8 score) external returns (uint256);
}

/// @title AIOracleMock
/// @notice Mock oracle that calls NetworkSecurityManager.submitAlert. In production this would be replaced by a secure oracle bridge.
contract AIOracleMock is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    INetworkSecurityManager public manager;

    constructor(address admin, address managerAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        manager = INetworkSecurityManager(managerAddress);
    }

    function setManager(address managerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        manager = INetworkSecurityManager(managerAddress);
    }

    function publishAlert(uint256 ruleId, string calldata evidenceHash, uint8 severity, uint8 score) external onlyRole(ORACLE_ROLE) returns (uint256) {
        return manager.submitAlert(ruleId, evidenceHash, severity, score);
    }
}
