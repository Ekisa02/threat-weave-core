# Sentinel Weave — Architecture

Overview

Sentinel Weave coordinates three classes of participants:

- AI Oracle: off-chain AI systems or infrastructure which analyze telemetry and trigger alerts. They are represented on-chain by accounts/contracts that hold ORACLE_ROLE.
- Operators: human or automated operators who manage rules and handle alerts. They hold OPERATOR_ROLE.
- Responders: addresses (or contracts) that take remediation actions; they may receive tokenized rewards.

Core Components

- AlertToken (ERC20): A utility token used to incentivize responders. Controlled via a MINTER_ROLE so tokens can be provisioned to the manager.

- NetworkSecurityManager:
  - Rules: Represent expected threat policies; owners can create, update, and deactivate rules.
  - Alerts: Ingested via ORACLE_ROLE; logged on-chain with metadata (evidence hash, score, severity).
  - Rewards: Manager can be funded with AlertToken and send rewards to responders when operators mark alerts as handled.
  - Role-based security: DEFAULT_ADMIN_ROLE (owner), ORACLE_ROLE (writers of alerts), OPERATOR_ROLE (managers of rules and handlers of alerts).

Data Flow

1. Rule is created by an operator and receives an id.
2. Off-chain AI detects an incident and (via an authorized oracle) calls submitAlert(ruleId, evidenceHash, severity, score).
3. Alert is recorded and an event is emitted for real-time off-chain processing.
4. Operators review and can call handleAlert(alertId, responder, reward) to mark it handled and optionally transfer tokens as incentive.

Security Considerations

- Validate inputs and guard role-restricted functions.
- Keep oracle private keys and services secure; on-chain the ORACLE_ROLE is authoritative for alerts.
- Carefully manage token minting and funding of the manager contract to avoid token leakage.

Extensibility

The design separates the oracle from the core manager so that alternative oracle mechanisms (Chainlink, custom relayers) can be integrated. Policy governance can be layered on top using DAOs or timelocked administration if required.
