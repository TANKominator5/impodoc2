import { Aptos, Ed25519Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

// Initialize Aptos client for testnet
const aptos = new Aptos({
  network: "testnet"
});

// Contract address from your Move contract
const CONTRACT_ADDRESS = "0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341";

// Your wallet address (the source of APT tokens)
const SOURCE_WALLET_ADDRESS = "0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341";

// Reward amounts in APT (1 APT = 100,000,000 octas)
const PATIENT_REWARD = 0.1 * 100000000; // 0.1 APT in octas
const PROFESSIONAL_REWARD = 0.2 * 100000000; // 0.2 APT in octas

export class RewardSystem {
  constructor() {
    this.aptos = aptos;
    this.contractAddress = CONTRACT_ADDRESS;
  }

  // Transfer APT tokens to a recipient
  async transferAPT(recipientAddress, amount, privateKey) {
    try {
      // Create account from private key
      const privateKeyObj = new Ed25519PrivateKey(privateKey);
      const account = new Ed25519Account(privateKeyObj);
      
      // Create and submit transaction using the simplified API
      const transaction = await this.aptos.build.transaction({
        sender: account.accountAddress,
        data: {
          function: "0x1::coin::transfer",
          type_arguments: ["0x1::aptos_coin::AptosCoin"],
          arguments: [recipientAddress, amount.toString()]
        }
      });

      // Sign and submit transaction
      const signedTxn = await this.aptos.sign.transaction({
        signer: account,
        transaction: transaction
      });
      
      const transactionRes = await this.aptos.submit.transaction({
        transaction: signedTxn
      });
      
      // Wait for transaction to be confirmed
      await this.aptos.waitForTransaction({
        transactionHash: transactionRes.hash
      });

      return {
        success: true,
        hash: transactionRes.hash,
        amount: amount / 100000000, // Convert back to APT
        recipient: recipientAddress
      };

    } catch (error) {
      console.error("Error transferring APT:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reward patient for verified prescription
  async rewardPatient(patientAddress, privateKey) {
    return await this.transferAPT(patientAddress, PATIENT_REWARD, privateKey);
  }

  // Reward medical professional for research contribution
  async rewardProfessional(professionalAddress, privateKey) {
    return await this.transferAPT(professionalAddress, PROFESSIONAL_REWARD, privateKey);
  }

  // Get account balance
  async getBalance(address) {
    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: address
      });
      
      const aptosCoin = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
      
      if (aptosCoin) {
        return parseFloat(aptosCoin.data.coin.value) / 100000000; // Convert to APT
      }
      return 0;
    } catch (error) {
      console.error("Error getting balance:", error);
      return 0;
    }
  }

  // Check if transaction was successful
  async checkTransactionStatus(hash) {
    try {
      const transaction = await this.aptos.getTransactionByHash({
        transactionHash: hash
      });
      return transaction.success;
    } catch (error) {
      console.error("Error checking transaction status:", error);
      return false;
    }
  }
}

// Export constants for use in components
export const REWARD_AMOUNTS = {
  PATIENT: 0.1,
  PROFESSIONAL: 0.2
};

export const SOURCE_ADDRESS = SOURCE_WALLET_ADDRESS;

// Clinical Data Sharing Functions
export class ClinicalDataContract {
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
}
