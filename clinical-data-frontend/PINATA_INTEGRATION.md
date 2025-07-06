# Pinata IPFS Integration

This application now uses Pinata for file uploads to IPFS (InterPlanetary File System) instead of Firebase Storage.

## How it Works

### File Upload Process
1. When a user uploads patient data (prescription PDF, MRI images, X-Ray images), files are uploaded to Pinata IPFS
2. Each file gets a unique CID (Content Identifier) that is stored in Firebase Firestore
3. The IPFS URLs are also stored for easy access to the files

### PinataService
The `PinataService` class handles all interactions with Pinata:

- **API Key**: Uses the provided Pinata API key for authentication
- **File Upload**: Uploads files to Pinata's IPFS network
- **Metadata**: Stores file metadata including upload time, file type, and user information
- **Error Handling**: Includes retry logic and timeout handling
- **File Size Limit**: 100MB per file

### Data Structure
Patient data in Firebase now includes both CIDs and URLs:

```javascript
{
  userId: "user_address",
  age: 25,
  caseDetectionDate: "2024-01-15",
  prescriptionCid: "QmX...", // IPFS CID
  prescriptionUrl: "https://gateway.pinata.cloud/ipfs/QmX...", // IPFS URL
  mriCid: "QmY...", // IPFS CID (if exists)
  mriUrl: "https://gateway.pinata.cloud/ipfs/QmY...", // IPFS URL (if exists)
  xrayCid: "QmZ...", // IPFS CID (if exists)
  xrayUrl: "https://gateway.pinata.cloud/ipfs/QmZ...", // IPFS URL (if exists)
  // ... other fields
}
```

### Benefits of IPFS
- **Decentralized**: Files are distributed across the IPFS network
- **Immutable**: Files cannot be modified once uploaded
- **Permanent**: Files remain accessible as long as they're pinned
- **Content-Addressable**: Files are identified by their content hash (CID)

### Security
- Files are uploaded to a private network on Pinata
- API key is stored in the service (should be moved to environment variables in production)
- File access is controlled through the application

### Error Handling
The service includes comprehensive error handling:
- Network timeouts (5-minute limit)
- File size validation
- API error responses
- Retry logic for transient failures

## Usage

The integration is transparent to the user - they simply upload files as before, but now the files are stored on IPFS instead of Firebase Storage.

## Configuration

To change the Pinata API key, update the `apiKey` property in `src/services/PinataService.js`:

```javascript
constructor() {
  this.apiKey = 'your-pinata-api-key';
  this.baseUrl = 'https://uploads.pinata.cloud/v3/files';
}
```

For production, consider moving the API key to environment variables. 