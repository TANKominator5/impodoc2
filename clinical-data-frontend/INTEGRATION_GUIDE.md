# Clinical Data Sharing - Move Contract Integration Guide

This guide documents the complete integration of your Move smart contract features into the frontend application.

## 🚀 New Features Added

### 1. **Patient Management System**
- **Add Patients**: Admins can register new patients with their data hashes
- **Patient Records**: Store patient information with consent management
- **Data Hash Tracking**: Link patient addresses to their clinical data hashes

### 2. **Access Control System**
- **Grant Access**: Patients can grant access to specific institutions
- **Revoke Access**: Patients can revoke access from institutions
- **Consent Management**: Track which institutions have access to patient data
- **Access Logging**: All access events are logged for audit purposes

### 3. **Token Reward System**
- **Reward Distribution**: Admins can reward contributors with tokens
- **Balance Tracking**: Check token balances for any address
- **Reward History**: Track all reward transactions

### 4. **Audit & Logging System**
- **Access Logs**: Complete audit trail of all data access events
- **Transaction Tracking**: All blockchain transactions are logged
- **Event History**: View historical access patterns

## 📁 New Files Created

### Services
- `src/services/ClinicalDataService.js` - Main service for contract interactions
- Updated `src/aptos/contract.js` - Added ClinicalDataContract class

### Components
- `src/components/AccessControl.jsx` - Patient access control interface
- `src/components/AccessControl.css` - Styling for access control
- Updated `src/components/AdminPanel.jsx` - Enhanced admin functionality
- `src/components/AdminPanel.css` - Styling for admin panel

### Routes
- Added `/access-control` route for patient access management

## 🔧 Contract Functions Integrated

### Admin Functions
```javascript
// Initialize contract state
await clinicalDataService.initializeContract(adminSigner)

// Add new patient
await clinicalDataService.addPatient(adminSigner, patientAddress, dataHash)

// Reward contributors
await clinicalDataService.rewardContribution(adminSigner, recipientAddress, amount)
```

### Patient Functions
```javascript
// Grant access to institution
await clinicalDataService.grantAccess(userSigner, institutionAddress)

// Revoke access from institution
await clinicalDataService.revokeAccess(userSigner, institutionAddress)

// Log access events
await clinicalDataService.logAccess(userSigner, patientAddress, action)
```

### View Functions
```javascript
// Get token balance
await clinicalDataService.getTokenBalance(address)
```

## 🎯 User Interface Features

### For Patients
1. **Access Control Dashboard** (`/access-control`)
   - Grant access to institutions
   - Revoke access from institutions
   - View consented institutions
   - Access logs and audit trail

2. **Dashboard Integration**
   - New "Manage Access" button in patient dashboard
   - Direct navigation to access control

### For Admins
1. **Enhanced Admin Panel** (`/admin`)
   - Patient Management tab
   - Add new patients with data hashes
   - View all registered patients
   - Check token balances

2. **Reward System tab**
   - Distribute rewards to contributors
   - View reward statistics
   - Track reward history

3. **Access Logs tab**
   - View system-wide access logs
   - Audit trail management

## 🔗 Contract Integration Details

### Contract Address
```javascript
const CONTRACT_ADDRESS = "0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341";
```

### Move Contract Functions Mapped
| Move Function | Frontend Method | Description |
|---------------|-----------------|-------------|
| `init` | `initializeContract()` | Initialize contract state |
| `add_patient` | `addPatient()` | Add new patient |
| `grant_access` | `grantAccess()` | Grant institution access |
| `revoke_access` | `revokeAccess()` | Revoke institution access |
| `log_access` | `logAccess()` | Log access events |
| `reward_contribution` | `rewardContribution()` | Reward contributors |
| `get_token_balance` | `getTokenBalance()` | Get token balance |

## 🗄️ Firebase Integration

### Collections Used
- `patients` - Patient records with consent information
- `accessLogs` - Access event logs
- `rewards` - Reward transaction history

### Data Structure
```javascript
// Patient Record
{
  address: "0x...",
  dataHash: "Qm...",
  consentedInstitutions: ["0x..."],
  createdAt: timestamp,
  lastUpdated: timestamp
}

// Access Log
{
  accessor: "0x...",
  patient: "0x...",
  action: "grant_access",
  institution: "0x...",
  timestamp: timestamp
}
```

## 🎨 UI/UX Features

### Design System
- Consistent with existing glassmorphism design
- Responsive design for mobile and desktop
- Loading states and error handling
- Success/error message feedback

### Navigation
- Seamless integration with existing navigation
- Breadcrumb navigation for complex flows
- Tab-based interfaces for organized content

## 🔐 Security Features

### Access Control
- Wallet-based authentication
- Role-based permissions
- Transaction signing requirements
- Audit trail for all actions

### Data Privacy
- Patient consent management
- Granular access control
- Revocation capabilities
- Complete audit logging

## 🚀 Getting Started

### Prerequisites
1. Deploy your Move contract to Aptos testnet
2. Update the contract address in `src/aptos/contract.js`
3. Ensure wallet connection is working

### Testing the Integration
1. **Admin Functions**:
   - Navigate to `/admin`
   - Initialize contract (one-time setup)
   - Add test patients
   - Distribute rewards

2. **Patient Functions**:
   - Connect patient wallet
   - Navigate to `/access-control`
   - Grant/revoke access to institutions
   - View access logs

3. **Token Functions**:
   - Check token balances
   - Distribute rewards
   - View reward history

## 🔧 Configuration

### Environment Variables
```javascript
// Contract configuration
CONTRACT_ADDRESS = "0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341"
NETWORK = "testnet" // or "mainnet"
```

### Firebase Configuration
Ensure your Firebase configuration includes the necessary collections:
- `patients`
- `accessLogs`
- `rewards`

## 📊 Monitoring & Analytics

### Transaction Tracking
- All blockchain transactions are logged
- Success/failure status tracking
- Gas cost monitoring
- Transaction hash storage

### Access Analytics
- Institution access patterns
- Patient consent trends
- Reward distribution statistics
- System usage metrics

## 🐛 Troubleshooting

### Common Issues
1. **Contract not initialized**: Run `initializeContract()` first
2. **Transaction failures**: Check wallet balance and network
3. **Access denied**: Verify wallet connection and permissions
4. **Data not loading**: Check Firebase configuration

### Debug Tools
- Browser console logging
- Transaction hash tracking
- Firebase real-time updates
- Network status monitoring

## 🔄 Future Enhancements

### Planned Features
- Batch operations for multiple patients
- Advanced analytics dashboard
- Automated reward distribution
- Multi-signature support
- Cross-chain integration

### Performance Optimizations
- Caching for frequently accessed data
- Batch transaction processing
- Lazy loading for large datasets
- Optimistic UI updates

## 📚 Additional Resources

- [Move Contract Documentation](./aptos-contract/sources/ClinicalDataSharing.move)
- [Aptos SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Documentation](https://reactrouter.com/)

---

This integration provides a complete bridge between your Move smart contract and the frontend application, enabling all the features defined in your contract while maintaining a user-friendly interface. 