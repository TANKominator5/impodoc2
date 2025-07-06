import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  where,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { RewardService } from "./RewardService";

class PatientDataService {
  constructor() {
    this.rewardService = new RewardService();
  }
  // Get all patient data from Firebase
  async getAllPatientData() {
    try {
      const patientsRef = collection(db, "patients");
      const q = query(patientsRef, orderBy("uploadedAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const patients = [];
      querySnapshot.forEach((doc) => {
        patients.push({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
          verifiedAt: doc.data().verifiedAt?.toDate?.() || doc.data().verifiedAt
        });
      });
      
      return patients;
    } catch (error) {
      console.error("Error fetching all patient data:", error);
      throw error;
    }
  }

  // Get patient data by address
  async getPatientDataByAddress(address) {
    try {
      const patientRef = doc(db, "patients", address);
      const patientSnap = await getDoc(patientRef);
      
      if (patientSnap.exists()) {
        const data = patientSnap.data();
        return {
          id: patientSnap.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate?.() || data.uploadedAt,
          verifiedAt: data.verifiedAt?.toDate?.() || data.verifiedAt
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching patient data:", error);
      throw error;
    }
  }

  // Get patient data for a specific user
  async getPatientDataForUser(userAddress) {
    try {
      const patientRef = doc(db, "patients", userAddress);
      const patientSnap = await getDoc(patientRef);
      
      if (patientSnap.exists()) {
        const data = patientSnap.data();
        return {
          id: patientSnap.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate?.() || data.uploadedAt,
          verifiedAt: data.verifiedAt?.toDate?.() || data.verifiedAt
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching patient data for user:", error);
      throw error;
    }
  }

  // Get total patient count
  async getTotalPatientCount() {
    try {
      const patientsRef = collection(db, "patients");
      const querySnapshot = await getDocs(patientsRef);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting patient count:", error);
      return 0;
    }
  }

  // Get patient statistics
  async getPatientStats() {
    try {
      const patients = await this.getAllPatientData();
      
      const stats = {
        total: patients.length,
        pending: patients.filter(p => p.status === "pending").length,
        verified: patients.filter(p => p.status === "verified").length,
        rejected: patients.filter(p => p.status === "rejected").length,
        totalRewardsDistributed: patients.filter(p => p.status === "verified").length * 0.1
      };
      
      return stats;
    } catch (error) {
      console.error("Error getting patient stats:", error);
      return {
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0,
        totalRewardsDistributed: 0
      };
    }
  }

  // Approve patient data (for doctors)
  async approvePatientData(patientAddress, doctorAddress, approvalNotes = "") {
    try {
      const patientRef = doc(db, "patients", patientAddress);
      
      await updateDoc(patientRef, {
        status: "verified",
        verifiedBy: doctorAddress,
        verifiedAt: serverTimestamp(),
        approvalNotes: approvalNotes,
        rewardEligible: true,
        rewardAmount: 0.1
      });

      // Send APT reward to patient
      const rewardResult = await this.rewardService.sendPatientReward(patientAddress, doctorAddress, 0.1);

      // Create reward record
      const rewardRef = doc(db, "rewards", `${patientAddress}_${Date.now()}`);
      await updateDoc(rewardRef, {
        type: "patient_verification",
        amount: 0.1,
        recipient: patientAddress,
        verifiedBy: doctorAddress,
        approvalNotes: approvalNotes,
        timestamp: serverTimestamp(),
        status: "completed",
        transactionHash: rewardResult.transactionHash
      });

      return { 
        success: true, 
        message: `Patient data approved successfully! ${rewardResult.message}` 
      };
    } catch (error) {
      console.error("Error approving patient data:", error);
      throw error;
    }
  }

  // Reject patient data (for doctors)
  async rejectPatientData(patientAddress, doctorAddress, rejectionNotes = "") {
    try {
      const patientRef = doc(db, "patients", patientAddress);
      
      await updateDoc(patientRef, {
        status: "rejected",
        verifiedBy: doctorAddress,
        verifiedAt: serverTimestamp(),
        rejectionNotes: rejectionNotes
      });

      return { 
        success: true, 
        message: "Patient data rejected successfully." 
      };
    } catch (error) {
      console.error("Error rejecting patient data:", error);
      throw error;
    }
  }

  // Format date for display
  formatDate(date) {
    if (!date) return "N/A";
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get status badge color
  getStatusColor(status) {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // amber
      case 'verified':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  // Get status badge text
  getStatusText(status) {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }
}

export default new PatientDataService(); 