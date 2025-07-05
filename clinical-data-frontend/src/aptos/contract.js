import { Aptos, Ed25519Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

// Initialize Aptos client for testnet
const aptos = new Aptos({
  network: "testnet"
});

// Your wallet address (the source of APT tokens)
const SOURCE_WALLET_ADDRESS = "0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341";

// Reward amounts in APT (1 APT = 100,000,000 octas)
const PATIENT_REWARD = 0.1 * 100000000; // 0.1 APT in octas
const PROFESSIONAL_REWARD = 0.2 * 100000000; // 0.2 APT in octas

export class RewardSystem {
  constructor() {
    this.aptos = aptos;
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
