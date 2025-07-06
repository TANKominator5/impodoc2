class PinataService {
  constructor() {
    this.apiKey = 'a7dab9f0b944f76ce673';
    this.baseUrl = 'https://uploads.pinata.cloud/v3/files';
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

      const form = new FormData();
      form.append("network", "private");
      form.append("name", file.name);
      form.append("group_id", "clinical-data");
      
      // Add metadata as keyvalues
      const keyvalues = {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size,
        ...metadata
      };
      form.append("keyvalues", JSON.stringify(keyvalues));
      
      // Add the file
      form.append("file", file);

      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      };

      // Add timeout to prevent stuck uploads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      try {
        console.log('Sending request to Pinata...');
        const response = await fetch(this.baseUrl, {
          ...options,
          body: form,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Pinata response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.log('Pinata error response:', errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            console.log('Could not parse error response as JSON');
          }
          throw new Error(`Pinata upload failed: ${errorMessage}`);
        }

        const result = await response.json();
        console.log('Pinata success response:', result);
        
        if (!result.IpfsHash) {
          throw new Error('No CID returned from Pinata');
        }

        return {
          cid: result.IpfsHash,
          name: result.Name,
          size: result.Size,
          timestamp: result.Timestamp,
          url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Fetch error details:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Upload timeout - please check your internet connection and try again');
        }
        
        // Check for network errors
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          throw new Error('Network error - please check your internet connection and try again');
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

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

  // Simple test method
  async testConnection() {
    try {
      const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const result = await this.uploadFile(testFile, { test: true });
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default PinataService; 