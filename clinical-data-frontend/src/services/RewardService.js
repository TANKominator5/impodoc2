import { RewardSystem, REWARD_AMOUNTS, SOURCE_ADDRESS } from '../aptos/contract';
import { doc, updateDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export class RewardService {
  constructor() {
    this.rewardSystem = new RewardSystem();
  }

  // Reward patient when their prescription is verified
  async rewardPatientForVerification(patientAddress, prescriptionId) {
    try {
      // Note: In a real implementation, you would need the private key of the source wallet
      // For now, we'll simulate the reward and store the transaction details
      
      const rewardData = {
        type: 'patient_verification',
        amount: REWARD_AMOUNTS.PATIENT,
        recipient: patientAddress,
        prescriptionId: prescriptionId,
        timestamp: serverTimestamp(),
        status: 'pending', // pending, completed, failed
        transactionHash: null,
        verifiedBy: null // Will be set by the doctor
      };

      // Store reward record in Firebase
      const rewardRef = doc(db, 'rewards', `${patientAddress}_${prescriptionId}`);
      await updateDoc(rewardRef, rewardData);

      // Update patient record to show they're eligible for reward
      const patientRef = doc(db, 'patients', patientAddress);
      await updateDoc(patientRef, {
        rewardEligible: true,
        rewardAmount: REWARD_AMOUNTS.PATIENT,
        lastUpdated: serverTimestamp()
      });

      return {
        success: true,
        message: `Patient ${patientAddress} is eligible for ${REWARD_AMOUNTS.PATIENT} APT reward`,
        rewardData
      };

    } catch (error) {
      console.error('Error rewarding patient:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reward medical professional for research contribution
  async rewardProfessionalForResearch(professionalAddress, researchData) {
    try {
      const rewardData = {
        type: 'professional_research',
        amount: REWARD_AMOUNTS.PROFESSIONAL,
        recipient: professionalAddress,
        researchData: researchData,
        timestamp: serverTimestamp(),
        status: 'pending',
        transactionHash: null
      };

      // Store reward record
      const rewardRef = doc(db, 'rewards', `${professionalAddress}_research_${Date.now()}`);
      await updateDoc(rewardRef, rewardData);

      // Update professional's record
      const userRef = doc(db, 'users', professionalAddress);
      await updateDoc(userRef, {
        researchRewardEligible: true,
        researchRewardAmount: REWARD_AMOUNTS.PROFESSIONAL,
        lastUpdated: serverTimestamp()
      });

      return {
        success: true,
        message: `Professional ${professionalAddress} is eligible for ${REWARD_AMOUNTS.PROFESSIONAL} APT reward`,
        rewardData
      };

    } catch (error) {
      console.error('Error rewarding professional:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process pending rewards (this would be called by an admin or automated system)
  async processPendingRewards(privateKey) {
    try {
      const rewardsRef = collection(db, 'rewards');
      const q = query(rewardsRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);

      const results = [];

      for (const doc of querySnapshot.docs) {
        const reward = doc.data();
        
        try {
          let transferResult;
          
          if (reward.type === 'patient_verification') {
            transferResult = await this.rewardSystem.rewardPatient(reward.recipient, privateKey);
          } else if (reward.type === 'professional_research') {
            transferResult = await this.rewardSystem.rewardProfessional(reward.recipient, privateKey);
          }

          if (transferResult.success) {
            // Update reward status
            await updateDoc(doc.ref, {
              status: 'completed',
              transactionHash: transferResult.hash,
              processedAt: serverTimestamp()
            });

            results.push({
              id: doc.id,
              success: true,
              hash: transferResult.hash,
              amount: transferResult.amount
            });
          } else {
            await updateDoc(doc.ref, {
              status: 'failed',
              error: transferResult.error,
              processedAt: serverTimestamp()
            });

            results.push({
              id: doc.id,
              success: false,
              error: transferResult.error
            });
          }
        } catch (error) {
          console.error(`Error processing reward ${doc.id}:`, error);
          results.push({
            id: doc.id,
            success: false,
            error: error.message
          });
        }
      }

      return results;

    } catch (error) {
      console.error('Error processing pending rewards:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get reward history for a user
  async getUserRewards(userAddress) {
    try {
      const rewardsRef = collection(db, 'rewards');
      const q = query(rewardsRef, where('recipient', '==', userAddress));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('Error getting user rewards:', error);
      return [];
    }
  }

  // Get total rewards earned by a user
  async getUserTotalRewards(userAddress) {
    try {
      const rewards = await this.getUserRewards(userAddress);
      const completedRewards = rewards.filter(r => r.status === 'completed');
      
      return completedRewards.reduce((total, reward) => total + reward.amount, 0);

    } catch (error) {
      console.error('Error getting user total rewards:', error);
      return 0;
    }
  }

  // Check if user has pending rewards
  async hasPendingRewards(userAddress) {
    try {
      const rewardsRef = collection(db, 'rewards');
      const q = query(
        rewardsRef, 
        where('recipient', '==', userAddress),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;

    } catch (error) {
      console.error('Error checking pending rewards:', error);
      return false;
    }
  }

  // Get reward statistics
  async getRewardStats() {
    try {
      const rewardsRef = collection(db, 'rewards');
      const querySnapshot = await getDocs(rewardsRef);

      const stats = {
        totalRewards: 0,
        totalAmount: 0,
        pendingRewards: 0,
        completedRewards: 0,
        failedRewards: 0
      };

      querySnapshot.docs.forEach(doc => {
        const reward = doc.data();
        stats.totalRewards++;
        stats.totalAmount += reward.amount || 0;

        if (reward.status === 'pending') stats.pendingRewards++;
        else if (reward.status === 'completed') stats.completedRewards++;
        else if (reward.status === 'failed') stats.failedRewards++;
      });

      return stats;

    } catch (error) {
      console.error('Error getting reward stats:', error);
      return {
        totalRewards: 0,
        totalAmount: 0,
        pendingRewards: 0,
        completedRewards: 0,
        failedRewards: 0
      };
    }
  }
}

// Export reward amounts for use in components
export { REWARD_AMOUNTS, SOURCE_ADDRESS }; 