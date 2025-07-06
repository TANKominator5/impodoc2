import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase";
import { RewardService } from "./RewardService";

class PrescriptionValidationService {
  constructor() {
    this.rewardService = new RewardService();
  }

  // Get all pending prescriptions for doctors to review
  async getPendingPrescriptions() {
    try {
      const patientsRef = collection(db, "patients");
      const q = query(
        patientsRef,
        where("status", "==", "pending"),
        orderBy("uploadedAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const prescriptions = [];
      
      querySnapshot.forEach((doc) => {
        prescriptions.push({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt
        });
      });
      
      return prescriptions;
    } catch (error) {
      console.error("Error fetching pending prescriptions:", error);
      throw error;
    }
  }

  // Get all prescriptions (pending, verified, rejected)
  async getAllPrescriptions() {
    try {
      const patientsRef = collection(db, "patients");
      const q = query(patientsRef, orderBy("uploadedAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const prescriptions = [];
      
      querySnapshot.forEach((doc) => {
        prescriptions.push({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
          verifiedAt: doc.data().verifiedAt?.toDate?.() || doc.data().verifiedAt
        });
      });
      
      return prescriptions;
    } catch (error) {
      console.error("Error fetching all prescriptions:", error);
      throw error;
    }
  }

  // Validate a prescription (approve)
  async validatePrescription(prescriptionId, doctorAddress, validationNotes = "") {
    try {
      const prescriptionRef = doc(db, "patients", prescriptionId);
      
      // Update prescription status
      await updateDoc(prescriptionRef, {
        status: "verified",
        verifiedBy: doctorAddress,
        verifiedAt: serverTimestamp(),
        validationNotes: validationNotes
      });

      // Reward the patient with 0.1 APT
      const rewardResult = await this.rewardService.rewardPatientForVerification(
        prescriptionId, // patient address
        prescriptionId // prescription ID
      );

      // Update the reward record with doctor information
      if (rewardResult.success) {
        const rewardRef = doc(db, 'rewards', `${prescriptionId}_${prescriptionId}`);
        await updateDoc(rewardRef, {
          verifiedBy: doctorAddress,
          validationNotes: validationNotes
        });
        console.log("Patient rewarded successfully:", rewardResult.message);
      } else {
        console.error("Failed to reward patient:", rewardResult.error);
      }

      return { 
        success: true, 
        message: "Prescription validated successfully! Patient has been rewarded with 0.1 APT.",
        rewardResult
      };
    } catch (error) {
      console.error("Error validating prescription:", error);
      throw error;
    }
  }

  // Reject a prescription
  async rejectPrescription(prescriptionId, doctorAddress, rejectionNotes = "") {
    try {
      const prescriptionRef = doc(db, "patients", prescriptionId);
      
      // Update prescription status
      await updateDoc(prescriptionRef, {
        status: "rejected",
        verifiedBy: doctorAddress,
        verifiedAt: serverTimestamp(),
        validationNotes: rejectionNotes
      });

      return { 
        success: true, 
        message: "Prescription rejected successfully." 
      };
    } catch (error) {
      console.error("Error rejecting prescription:", error);
      throw error;
    }
  }

  // Get prescription statistics
  async getPrescriptionStats() {
    try {
      const prescriptions = await this.getAllPrescriptions();
      
      const stats = {
        total: prescriptions.length,
        pending: prescriptions.filter(p => p.status === "pending").length,
        verified: prescriptions.filter(p => p.status === "verified").length,
        rejected: prescriptions.filter(p => p.status === "rejected").length,
        totalRewardsDistributed: prescriptions.filter(p => p.status === "verified").length * 0.1
      };
      
      return stats;
    } catch (error) {
      console.error("Error getting prescription stats:", error);
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
        return '#ffc107'; // yellow
      case 'verified':
        return '#28a745'; // green
      case 'rejected':
        return '#dc3545'; // red
      default:
        return '#6c757d'; // gray
    }
  }

  // Get file size in readable format
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate doctor permissions
  async validateDoctorPermissions(doctorAddress) {
    try {
      const userRef = doc(db, "users", doctorAddress);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { hasPermission: false, reason: "User not found" };
      }
      
      const userData = userDoc.data();
      
      if (userData.verificationStatus !== "approved") {
        return { hasPermission: false, reason: "Doctor not verified" };
      }
      
      if (userData.role !== "Doctor") {
        return { hasPermission: false, reason: "User is not a doctor" };
      }
      
      return { hasPermission: true };
    } catch (error) {
      console.error("Error validating doctor permissions:", error);
      return { hasPermission: false, reason: "Error checking permissions" };
    }
  }
}

export default new PrescriptionValidationService(); 