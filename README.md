# Sentinel Weave

Sentinel Weave is an AI-powered network security orchestration framework implemented in Solidity using Hardhat and OpenZeppelin. It demonstrates secure, auditable handling of AI-sourced alerts, operator-managed security policies, and tokenized incentives for responders.

## Highlights

- Oracle-driven alert ingestion (AI systems submit alerts via an authenticated oracle role).
- Policy/rule lifecycle managed by operators with role-based access control.
- Tokenized incentive mechanics (ERC20 AlertToken) to reward responders.
- Modular, test-covered architecture ready for integration with off-chain AI systems and on-chain governance.

## Repository layout

- contracts/ - Solidity contracts
  - AlertToken.sol - ERC20 used for incentive payments
  - NetworkSecurityManager.sol - Core manager: rules, alerts, roles, rewards
  - AIOracleMock.sol - Minimal oracle mock used in tests and simulations

- scripts/ - convenience scripts
  - deploy.js - deploy token and manager
  - simulateAlert.js - simulate an AI oracle submitting alerts

- test/ - automated tests (Hardhat / Mocha / Chai)
- docs/ - architecture and design notes
- hardhat.config.js - Hardhat configuration
- package.json - Node project metadata & dependencies
- .gitignore - common ignores

## Architecture

See docs/architecture.md for a component diagram and data flow. In brief:

1. AI system (off-chain) analyzes telemetry and, when it detects an incident that matches an on-chain rule, sends structured alert data to an authorized on-chain oracle (or via a trusted oracle service).
2. The oracle contract (or an oracle operator) calls NetworkSecurityManager.submitAlert(...). Alerts are stored immutably and emit events for off-chain systems.
3. Operator roles manage rule creation, updates, and deprecation.
4. Responders (or automation) can handle alerts; the manager can send token rewards (AlertToken) to responders.

Security & access control are enforced via OpenZeppelin AccessControl.

## Getting started

Prerequisites

- Node.js (16+ recommended)
- npm or yarn

Install

1. Install dependencies

   npm install

2. Compile contracts

   npx hardhat compile

Run tests

   npx hardhat test

Deploy to a local Hardhat node (example)

1. Start a node

   npx hardhat node

2. Deploy

   node scripts/deploy.js --network localhost

Simulate an alert

   node scripts/simulateAlert.js --network localhost

## Design notes & security

- Critical functions are guarded by roles: DEFAULT_ADMIN_ROLE, ORACLE_ROLE, OPERATOR_ROLE.
- Alerts and rule changes are emitted as events so off-chain AI and operator tooling can monitor and react.
- Token transfers rely on the manager being pre-funded; minting is controlled by MINTER_ROLE on AlertToken.

For more details, consult docs/architecture.md and the contract NatSpec comments.

## Contributing

Contributions, issues, and feature requests are welcome. Please follow normal repository etiquette and open issues for major changes.
