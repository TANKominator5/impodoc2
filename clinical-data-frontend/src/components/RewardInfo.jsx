import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RewardService, REWARD_AMOUNTS } from '../services/RewardService';
import './RewardInfo.css';

export default function RewardInfo() {
  const { currentUser } = useAuth();
  const [rewardInfo, setRewardInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);

  const rewardService = new RewardService();

  useEffect(() => {
    if (currentUser?.address) {
      fetchRewardInfo();
    }
  }, [currentUser]);

  const fetchRewardInfo = async () => {
    try {
      setLoading(true);
      
      // Get user's reward history
      const userRewards = await rewardService.getUserRewards(currentUser.address);
      setRewards(userRewards);

      // Get total rewards earned
      const totalRewards = await rewardService.getUserTotalRewards(currentUser.address);
      
      // Check for pending rewards
      const hasPending = await rewardService.hasPendingRewards(currentUser.address);

      setRewardInfo({
        totalEarned: totalRewards,
        hasPendingRewards: hasPending,
        totalRewards: userRewards.length
      });

    } catch (error) {
      console.error('Error fetching reward info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRewardStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#f59e0b', text: 'Pending' },
      completed: { color: '#10b981', text: 'Completed' },
      failed: { color: '#ef4444', text: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span 
        className="reward-status-badge"
        style={{ backgroundColor: config.color }}
      >
        {config.text}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="reward-info-card">
        <div className="loading-spinner"></div>
        <p>Loading reward information...</p>
      </div>
    );
  }

  if (!rewardInfo) {
    return null;
  }

  return (
    <div className="reward-info-container">
      <div className="reward-summary-card">
        <div className="reward-header">
          <h3>🎁 Reward Information</h3>
          {rewardInfo.hasPendingRewards && (
            <span className="pending-indicator">Pending Rewards</span>
          )}
        </div>
        
        <div className="reward-stats">
          <div className="stat-item">
            <span className="stat-value">{rewardInfo.totalEarned.toFixed(2)}</span>
            <span className="stat-label">APT Earned</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{rewardInfo.totalRewards}</span>
            <span className="stat-label">Total Rewards</span>
          </div>
          {rewardInfo.hasPendingRewards && (
            <div className="stat-item pending">
              <span className="stat-value">⏳</span>
              <span className="stat-label">Pending</span>
            </div>
          )}
        </div>

        <div className="reward-info">
          <h4>Reward Rates</h4>
          <div className="reward-rates">
            <div className="rate-item">
              <span className="rate-label">Patient Verification:</span>
              <span className="rate-value">{REWARD_AMOUNTS.PATIENT} APT</span>
            </div>
            <div className="rate-item">
              <span className="rate-label">Research Contribution:</span>
              <span className="rate-value">{REWARD_AMOUNTS.PROFESSIONAL} APT</span>
            </div>
          </div>
        </div>
      </div>

      {rewards.length > 0 && (
        <div className="reward-history-card">
          <h4>Reward History</h4>
          <div className="reward-list">
            {rewards.map((reward, index) => (
              <div key={reward.id || index} className="reward-item">
                <div className="reward-details">
                  <div className="reward-type">
                    {reward.type === 'patient_verification' ? '📋 Patient Verification' : '🔬 Research Contribution'}
                  </div>
                  <div className="reward-amount">{reward.amount} APT</div>
                  {getRewardStatusBadge(reward.status)}
                </div>
                <div className="reward-date">
                  {formatDate(reward.timestamp)}
                </div>
                {reward.transactionHash && (
                  <div className="transaction-hash">
                    <a 
                      href={`https://explorer.aptoslabs.com/txn/${reward.transactionHash}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="txn-link"
                    >
                      View Transaction
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 