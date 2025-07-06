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

class VerificationService {
  // Fetch all pending verification requests
  async getPendingVerifications() {
    try {
      const verificationsRef = collection(db, "verifications");
      const q = query(
        verificationsRef,
        where("status", "==", "pending"),
        orderBy("submittedAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const verifications = [];
      
      querySnapshot.forEach((doc) => {
        verifications.push({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt
        });
      });
      
      return verifications;
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      throw error;
    }
  }

  // Fetch all verification requests (pending, approved, rejected)
  async getAllVerifications() {
    try {
      const verificationsRef = collection(db, "verifications");
      const q = query(verificationsRef, orderBy("submittedAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const verifications = [];
      
      querySnapshot.forEach((doc) => {
        verifications.push({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
          reviewedAt: doc.data().reviewedAt?.toDate?.() || doc.data().reviewedAt
        });
      });
      
      return verifications;
    } catch (error) {
      console.error("Error fetching all verifications:", error);
      throw error;
    }
  }

  // Approve a verification request
  async approveVerification(verificationId, adminAddress, reviewNotes = "") {
    try {
      const verificationRef = doc(db, "verifications", verificationId);
      
      // Get the verification data first
      const verificationDoc = await getDoc(verificationRef);
      const verificationData = verificationDoc.data();
      
      // Update verification status
      await updateDoc(verificationRef, {
        status: "approved",
        reviewedBy: adminAddress,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewNotes
      });

      // Update user's verification status in users collection
      const userRef = doc(db, "users", verificationId);
      await updateDoc(userRef, {
        verificationStatus: "approved",
        role: verificationData?.role
      }, { merge: true });

      return { success: true, message: "Verification approved successfully" };
    } catch (error) {
      console.error("Error approving verification:", error);
      throw error;
    }
  }

  // Reject a verification request
  async rejectVerification(verificationId, adminAddress, reviewNotes = "") {
    try {
      const verificationRef = doc(db, "verifications", verificationId);
      
      // Update verification status
      await updateDoc(verificationRef, {
        status: "rejected",
        reviewedBy: adminAddress,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewNotes
      });

      // Update user's verification status in users collection
      const userRef = doc(db, "users", verificationId);
      await updateDoc(userRef, {
        verificationStatus: "rejected"
      });

      return { success: true, message: "Verification rejected successfully" };
    } catch (error) {
      console.error("Error rejecting verification:", error);
      throw error;
    }
  }

  // Get verification statistics
  async getVerificationStats() {
    try {
      const verifications = await this.getAllVerifications();
      
      const stats = {
        total: verifications.length,
        pending: verifications.filter(v => v.status === "pending").length,
        approved: verifications.filter(v => v.status === "approved").length,
        rejected: verifications.filter(v => v.status === "rejected").length,
        doctors: verifications.filter(v => v.role === "Doctor").length,
        researchers: verifications.filter(v => v.role === "Researcher").length
      };
      
      return stats;
    } catch (error) {
      console.error("Error getting verification stats:", error);
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
      case 'approved':
        return '#28a745'; // green
      case 'rejected':
        return '#dc3545'; // red
      default:
        return '#6c757d'; // gray
    }
  }
}

export default new VerificationService(); 