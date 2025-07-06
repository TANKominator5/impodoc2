# Clinical Data Sharing Platform

A decentralized platform for secure clinical data sharing, leveraging blockchain (Aptos Move), React frontend, and IPFS (Pinata) for storage.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Smart Contract (Aptos Move)](#smart-contract-aptos-move)
- [Frontend (React)](#frontend-react)
- [Pinata Integration](#pinata-integration)
- [Authentication & Authorization](#authentication--authorization)
- [How to Run](#how-to-run)
- [Development Guide](#development-guide)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

This project enables patients, researchers, and administrators to interact with clinical data in a secure, privacy-preserving, and decentralized manner. It uses the Aptos blockchain for access control and data integrity, React for the user interface, and IPFS (via Pinata) for off-chain data storage.

---

## Architecture

- **Aptos Move Smart Contract**: Handles access control, permissions, and data sharing logic.
- **React Frontend**: User interface for patients, researchers, and admins.
- **Pinata/IPFS**: Stores encrypted clinical data files.
- **Firebase**: Used for authentication and user management.

---

## Features

- Patient data upload and management
- Researcher data access requests and submissions
- Admin panel for verification and access control
- Blockchain-based access control (Aptos Move)
- Decentralized file storage (IPFS/Pinata)
- Wallet integration (Petra, etc.)
- Reward system for data sharing
- Secure authentication (Firebase)

---

## Folder Structure

```
aptos-contract/
  Move.toml
  sources/
    ClinicalDataSharing.move   # Move smart contract

clinical-data-frontend/
  public/
    ...                       # Static assets
  src/
    App.js                    # Main React app
    firebase.js               # Firebase config
    aptos/
      contract.js             # Blockchain interaction
    components/               # Reusable UI components
    context/
      AuthContext.js          # Auth context provider
    pages/                    # Page-level components
    services/                 # API and blockchain services
  package.json                # Frontend dependencies
```

---

## Smart Contract (Aptos Move)

- **Location**: `aptos-contract/sources/ClinicalDataSharing.move`
- **Purpose**: Manages permissions, access requests, and logs all data sharing events on-chain.
- **Key Concepts**:
  - Patients register and upload data references (IPFS hashes).
  - Researchers request access; admins approve/reject.
  - All actions are logged for auditability.

### How to Deploy

1. Install Aptos CLI.
2. Configure your Aptos account.
3. Deploy the contract:
   ```sh
   aptos move publish --package-dir aptos-contract
   ```

---

## Frontend (React)

- **Location**: `clinical-data-frontend/`
- **Key Files**:
  - `App.js`: Main app entry.
  - `firebase.js`: Auth setup.
  - `aptos/contract.js`: Blockchain interaction logic.
  - `components/`: UI components (Navbar, Modals, Dashboards, etc.)
  - `pages/`: Main pages (Home, Login, Dashboard, AdminView, etc.)
  - `services/`: API and blockchain service logic.

### Main Components

- **Navbar**: Navigation bar, wallet connect.
- **PatientDashboard**: Patient's data and uploads.
- **AdminPanel**: Admin actions and verifications.
- **ResearchSubmission**: Researchers submit requests.
- **WalletConnect**: Connects to Aptos wallets.

---

## Pinata Integration

- **Purpose**: Store encrypted clinical data files on IPFS.
- **Location**: `services/PinataService.js`
- **Usage**:
  - Upload files to IPFS via Pinata API.
  - Store returned hash on blockchain for reference.

---

## Authentication & Authorization

- **Firebase**: Handles user sign-up, login, and session management.
- **AuthContext**: React context for managing auth state.
- **Role-based Access**: Patients, Researchers, Admins.

---

## How to Run

### Prerequisites

- Node.js & npm
- Aptos CLI
- Pinata account (for IPFS)
- Firebase project

### 1. Deploy Smart Contract

See [Smart Contract](#smart-contract-aptos-move) section.

### 2. Setup Frontend

```sh
cd clinical-data-frontend
npm install
```

#### Configure Environment

- Set up Firebase in `firebase.js`.
- Set Pinata API keys in `services/PinataService.js`.
- Update blockchain contract address in `aptos/contract.js`.

### 3. Run Frontend

```sh
npm start
```

App will be available at `http://localhost:3000`.

---

## Development Guide

- **Adding New Features**: Use the `services/` directory for API logic, `components/` for UI, and `pages/` for new views.
- **Testing**: Use `App.test.js` and `setupTests.js` for unit tests.
- **Styling**: CSS files are colocated with components/pages.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

[MIT](LICENSE)

---
## Personl Contact Details:

Debajit Pal   : debajitpal.380718@gmail.com , Ph: 7044895962
Arijit Mondal : arijitmondal541@gmail.com   , ph: 9123808534    
Sriz Debnath  : srizd449@gmail.com  , ph: 6294441424
