// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title NetworkSecurityManager
/// @notice Manage security rules, ingest AI alerts (via oracle role) and reward responders
contract NetworkSecurityManager is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    IERC20 public rewardToken;

    uint256 private _ruleCount;
    uint256 private _alertCount;

    struct Rule {
        uint256 id;
        string description;
        bool active;
        uint8 severity; // 1-5
    }

    struct Alert {
        uint256 id;
        uint256 ruleId;
        address submitter; // oracle
        uint256 timestamp;
        string evidenceHash; // IPFS/CID or hash
        uint8 severity;
        uint8 score; // AI confidence 0-100 stored in 0-255
        bool handled;
    }

    mapping(uint256 => Rule) public rules;
    mapping(uint256 => Alert) public alerts;

    event RuleCreated(uint256 indexed ruleId, string description, uint8 severity);
    event RuleUpdated(uint256 indexed ruleId, string description, bool active, uint8 severity);
    event AlertSubmitted(uint256 indexed alertId, uint256 indexed ruleId, address indexed submitter, string evidenceHash, uint8 severity, uint8 score);
    event AlertHandled(uint256 indexed alertId, address indexed handler, address responder, uint256 reward);
    event RewardTokenSet(address indexed token);

    constructor(address admin, address tokenAddress) {
        require(admin != address(0), "admin-zero");
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        rewardToken = IERC20(tokenAddress);
        emit RewardTokenSet(tokenAddress);
    }

    /* ========== RULE MANAGEMENT ========== */
    function createRule(string calldata description, uint8 severity) external onlyRole(OPERATOR_ROLE) returns (uint256) {
        require(severity >= 1 && severity <= 5, "invalid-severity");
        _ruleCount += 1;
        rules[_ruleCount] = Rule({id: _ruleCount, description: description, active: true, severity: severity});
        emit RuleCreated(_ruleCount, description, severity);
        return _ruleCount;
    }

    function updateRule(uint256 ruleId, string calldata description, bool active, uint8 severity) external onlyRole(OPERATOR_ROLE) {
        require(rules[ruleId].id != 0, "rule-not-found");
        rules[ruleId].description = description;
        rules[ruleId].active = active;
        rules[ruleId].severity = severity;
        emit RuleUpdated(ruleId, description, active, severity);
    }

    /* ========== ALERT INGESTION ========== */
    function submitAlert(uint256 ruleId, string calldata evidenceHash, uint8 severity, uint8 score) external onlyRole(ORACLE_ROLE) returns (uint256) {
        require(rules[ruleId].id != 0, "rule-not-found");
        require(rules[ruleId].active, "rule-inactive");
        _alertCount += 1;
        alerts[_alertCount] = Alert({
            id: _alertCount,
            ruleId: ruleId,
            submitter: msg.sender,
            timestamp: block.timestamp,
            evidenceHash: evidenceHash,
            severity: severity,
            score: score,
            handled: false
        });
        emit AlertSubmitted(_alertCount, ruleId, msg.sender, evidenceHash, severity, score);
        return _alertCount;
    }

    /* ========== ALERT HANDLING & REWARDS ========== */
    function handleAlert(uint256 alertId, address responder, uint256 rewardAmount) external onlyRole(OPERATOR_ROLE) {
        Alert storage a = alerts[alertId];
        require(a.id != 0, "alert-not-found");
        require(!a.handled, "alert-already-handled");
        a.handled = true;

        if (rewardAmount > 0) {
            // Manager contract must be funded with reward tokens beforehand
            require(rewardToken.transfer(responder, rewardAmount), "reward-transfer-failed");
        }

        emit AlertHandled(alertId, msg.sender, responder, rewardAmount);
    }

    /* ========== ADMIN ========== */
    function setRewardToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardToken = IERC20(token);
        emit RewardTokenSet(token);
    }

    function version() external pure returns (string memory) {
        return "SentinelWeavev1";
    }
}
