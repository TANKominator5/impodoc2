import { Aptos } from "@aptos-labs/ts-sdk";
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Initialize Aptos client
const aptos = new Aptos({
  network: "testnet"
});

// Contract address from your Move contract
const CONTRACT_ADDRESS = "0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341";

export class ClinicalDataService {
  constructor() {
    this.aptos = aptos;
    this.contractAddress = CONTRACT_ADDRESS;
  }

  // Initialize contract state (admin only)
  async initializeContract(adminSigner) {
    try {
      const payload = {
        function: `${this.contractAddress}::ClinicalDataSharing::init`,
        type_arguments: [],
        arguments: []
      };

      const transaction = await this.aptos.build.transaction({
        sender: adminSigner.accountAddress,
        data: payload
      });

      const signedTxn = await this.aptos.sign.transaction({
        signer: adminSigner,
        transaction: transaction
      });

      const transactionRes = await this.aptos.submit.transaction({
        transaction: signedTxn
      });

      await this.aptos.waitForTransaction({
        transactionHash: transactionRes.hash
      });

      return {
        success: true,
        hash: transactionRes.hash
      };
    } catch (error) {
      console.error("Error initializing contract:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add a new patient with data hash
  async addPatient(adminSigner, patientAddress, dataHash) {
    try {
      const payload = {
        function: `${this.contractAddress}::ClinicalDataSharing::add_patient`,
        type_arguments: [],
        arguments: [patientAddress, dataHash]
      };

      const transaction = await this.aptos.build.transaction({
        sender: adminSigner.accountAddress,
        data: payload
      });

      const signedTxn = await this.aptos.sign.transaction({
        signer: adminSigner,
        transaction: transaction
      });

      const transactionRes = await this.aptos.submit.transaction({
        transaction: signedTxn
      });

      await this.aptos.waitForTransaction({
        transactionHash: transactionRes.hash
      });

      // Also store in Firebase for frontend access
      await this.storePatientInFirebase(patientAddress, dataHash);

      return {
        success: true,
        hash: transactionRes.hash,
        patientAddress,
        dataHash
      };
    } catch (error) {
      console.error("Error adding patient:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Grant access to an institution
  async grantAccess(userSigner, institutionAddress) {
    try {
      const payload = {
        function: `${this.contractAddress}::ClinicalDataSharing::grant_access`,
        type_arguments: [],
        arguments: [institutionAddress]
      };

      const transaction = await this.aptos.build.transaction({
        sender: userSigner.accountAddress,
        data: payload
      });

      const signedTxn = await this.aptos.sign.transaction({
        signer: userSigner,
        transaction: transaction
      });

      const transactionRes = await this.aptos.submit.transaction({
        transaction: signedTxn
      });

      await this.aptos.waitForTransaction({
        transactionHash: transactionRes.hash
      });

      // Log the access grant
      await this.logAccessEvent(userSigner.accountAddress, userSigner.accountAddress, "grant_access", institutionAddress);

      return {
        success: true,
        hash: transactionRes.hash,
        institution: institutionAddress
      };
    } catch (error) {
      console.error("Error granting access:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Revoke access from an institution
  async revokeAccess(userSigner, institutionAddress) {
    try {
      const payload = {
        function: `${this.contractAddress}::ClinicalDataSharing::revoke_access`,
        type_arguments: [],
        arguments: [institutionAddress]
      };

      const transaction = await this.aptos.build.transaction({
        sender: userSigner.accountAddress,
        data: payload
      });

      const signedTxn = await this.aptos.sign.transaction({
        signer: userSigner,
        transaction: transaction
      });

      const transactionRes = await this.aptos.submit.transaction({
        transaction: signedTxn
      });

      await this.aptos.waitForTransaction({
        transactionHash: transactionRes.hash
      });

      // Log the access revocation
      await this.logAccessEvent(userSigner.accountAddress, userSigner.accountAddress, "revoke_access", institutionAddress);

      return {
        success: true,
        hash: transactionRes.hash,
        institution: institutionAddress
      };
    } catch (error) {
      console.error("Error revoking access:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Log access events
  async logAccess(userSigner, patientAddress, action) {
    try {
      const payload = {
        function: `${this.contractAddress}::ClinicalDataSharing::log_access`,
        type_arguments: [],
        arguments: [patientAddress, action]
      };

      const transaction = await this.aptos.build.transaction({
        sender: userSigner.accountAddress,
        data: payload
      });

      const signedTxn = await this.aptos.sign.transaction({
        signer: userSigner,
        transaction: transaction
      });

      const transactionRes = await this.aptos.submit.transaction({
        transaction: signedTxn
      });

      await this.aptos.waitForTransaction({
        transactionHash: transactionRes.hash
      });

      // Also store in Firebase for easier querying
      await this.logAccessEvent(userSigner.accountAddress, patientAddress, action);

      return {
        success: true,
        hash: transactionRes.hash,
        action
      };
    } catch (error) {
      console.error("Error logging access:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reward contributors
  async rewardContribution(adminSigner, recipientAddress, amount) {
    try {
      const payload = {
        function: `${this.contractAddress}::ClinicalDataSharing::reward_contribution`,
        type_arguments: [],
        arguments: [recipientAddress, amount]
      };

      const transaction = await this.aptos.build.transaction({
        sender: adminSigner.accountAddress,
        data: payload
      });

      const signedTxn = await this.aptos.sign.transaction({
        signer: adminSigner,
        transaction: transaction
      });

      const transactionRes = await this.aptos.submit.transaction({
        transaction: signedTxn
      });

      await this.aptos.waitForTransaction({
        transactionHash: transactionRes.hash
      });

      return {
        success: true,
        hash: transactionRes.hash,
        recipient: recipientAddress,
        amount
      };
    } catch (error) {
      console.error("Error rewarding contribution:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get token balance for an address
  async getTokenBalance(address) {
    try {
      const payload = {
        function: `${this.contractAddress}::ClinicalDataSharing::get_token_balance`,
        type_arguments: [],
        arguments: [address]
      };

      const response = await this.aptos.view({
        payload
      });

      return {
        success: true,
        balance: response[0],
        address
      };
    } catch (error) {
      console.error("Error getting token balance:", error);
      return {
        success: false,
        error: error.message,
        balance: 0
      };
    }
  }

  // Firebase helper methods for frontend integration

  async storePatientInFirebase(patientAddress, dataHash) {
    try {
      const patientRef = doc(db, 'patients', patientAddress);
      await setDoc(patientRef, {
        address: patientAddress,
        dataHash: dataHash,
        consentedInstitutions: [],
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error("Error storing patient in Firebase:", error);
    }
  }

  async logAccessEvent(accessorAddress, patientAddress, action, institutionAddress = null) {
    try {
      const logRef = doc(collection(db, 'accessLogs'));
      await setDoc(logRef, {
        accessor: accessorAddress,
        patient: patientAddress,
        action: action,
        institution: institutionAddress,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error logging access event:", error);
    }
  }

  // Get patient data from Firebase
  async getPatientData(patientAddress) {
    try {
      const patientRef = doc(db, 'patients', patientAddress);
      const patientDoc = await getDoc(patientRef);
      
      if (patientDoc.exists()) {
        return {
          success: true,
          data: patientDoc.data()
        };
      } else {
        return {
          success: false,
          error: "Patient not found"
        };
      }
    } catch (error) {
      console.error("Error getting patient data:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get access logs for a patient
  async getAccessLogs(patientAddress) {
    try {
      const logsRef = collection(db, 'accessLogs');
      const q = query(logsRef, where('patient', '==', patientAddress));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting access logs:", error);
      return [];
    }
  }

  // Get all patients
  async getAllPatients() {
    try {
      const patientsRef = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsRef);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting all patients:", error);
      return [];
    }
  }

  // Update patient consent
  async updatePatientConsent(patientAddress, consentedInstitutions) {
    try {
      const patientRef = doc(db, 'patients', patientAddress);
      await updateDoc(patientRef, {
        consentedInstitutions: consentedInstitutions,
        lastUpdated: serverTimestamp()
      });

      return {
        success: true,
        patientAddress,
        consentedInstitutions
      };
    } catch (error) {
      console.error("Error updating patient consent:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ClinicalDataService; 