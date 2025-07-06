class PinataService {
  constructor() {
    // 🚨 IMPORTANT: Make sure this is your JWT key from Pinata
    this.apiKey = process.env.REACT_APP_PINATA_JWT_TOKEN;
    
    if (!this.apiKey) {
      throw new Error('Pinata JWT token not found. Please set REACT_APP_PINATA_JWT_TOKEN in your .env file');
    }
    
    // ✅ CORRECTED: Use the standard and correct API endpoint for pinning files
    this.baseUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  }

  async uploadFile(file, metadata = {}) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error('File size exceeds 100MB limit');
      }

      console.log('Starting Pinata upload for file:', file.name, 'Size:', file.size);

      // ✅ CORRECTED: The modern Pinata API expects a FormData object 
      // with 'file' and 'pinataOptions'/'pinataMetadata'
      const form = new FormData();
      form.append('file', file, file.name);

      // Add metadata
      const pinataMetadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          fileType: file.type,
          fileSize: file.size,
          ...metadata // Add any other custom metadata passed in
        }
      });
      form.append('pinataMetadata', pinataMetadata);

      // Add options (e.g., CID version)
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      form.append('pinataOptions', pinataOptions);

      // ✅ CORRECTED: The fetch request options remain largely the same,
      // but we are now sending to the correct URL.
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: form,
      };

      console.log('Sending request to Pinata...');
      const response = await fetch(this.baseUrl, options);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Pinata error response:', errorData);
          errorMessage = errorData.error?.details || errorData.error?.reason || errorMessage;
        } catch (e) {
          console.error('Could not parse error response as JSON');
        }
        throw new Error(`Pinata upload failed: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('Pinata success response:', result);
      
      if (!result.IpfsHash) {
        throw new Error('No CID (IpfsHash) returned from Pinata');
      }

      // Return the data in the format the rest of your app expects
      return {
        cid: result.IpfsHash,
        name: file.name,
        size: result.PinSize,
        timestamp: result.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      };

    } catch (error) {
      console.error('Pinata upload error:', error);
      // This final error message is what your user will see in the alert
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  // NOTE: This function does not need any changes as it relies on the corrected uploadFile method above.
  async uploadMultipleFiles(files, metadata = {}) {
    const results = {};
    
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        try {
          const fileMetadata = {
            ...metadata,
            fileCategory: key,
            userId: metadata.userId || 'unknown'
          };
          
          results[key] = await this.uploadFile(file, fileMetadata);
        } catch (error) {
          console.error(`Failed to upload ${key}:`, error);
          throw error;
        }
      }
    }
    
    return results;
  }
}

export default PinataService;