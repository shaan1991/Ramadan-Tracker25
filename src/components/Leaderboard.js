import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import './Leaderboard.css';

const Leaderboard = ({ userId }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('streak'); // 'streak', 'prayers', 'quraan'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        
        // Determine sort field based on filter
        const sortField = 
          filter === 'streak' ? 'currentStreak' :
          filter === 'prayers' ? 'totalPrayersCompleted' :
          'juzsCompleted';

        // Get top 10 users
        const q = query(
          usersRef,
          orderBy(sortField, 'desc'),
          limit(20)
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map((doc, index) => ({
            rank: index + 1,
            id: doc.id,
            name: doc.data().displayName || 'Anonymous',
            value: doc.data()[sortField] || 0,
            isCurrentUser: doc.id === userId
          }))
          .filter((item, idx) => {
            // Find current user's rank
            if (item.isCurrentUser) {
              setUserRank(item.rank);
            }
            return idx < 10; // Top 10
          });

        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter, userId]);

  const getValueLabel = () => {
    switch(filter) {
      case 'streak': return 'Days';
      case 'prayers': return 'Prayers';
      case 'quraan': return 'Juzs';
      default: return '';
    }
  };

  const getIcon = () => {
    switch(filter) {
      case 'streak': return '🔥';
      case 'prayers': return '🤲';
      case 'quraan': return '📖';
      default: return '';
    }
  };

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3>🏆 Leaderboard</h3>
        <p className="leaderboard-subtitle">
          {userRank ? `Your Rank: #${userRank}` : 'Join to compete!'}
        </p>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === 'streak' ? 'active' : ''}`}
          onClick={() => setFilter('streak')}
        >
          Streak
        </button>
        <button 
          className={`filter-btn ${filter === 'prayers' ? 'active' : ''}`}
          onClick={() => setFilter('prayers')}
        >
          Prayers
        </button>
        <button 
          className={`filter-btn ${filter === 'quraan' ? 'active' : ''}`}
          onClick={() => setFilter('quraan')}
        >
          Qur'an
        </button>
      </div>

      <div className="leaderboard-list">
        {leaderboardData.length === 0 ? (
          <p className="no-data">No leaderboard data yet</p>
        ) : (
          leaderboardData.map((user) => (
            <div 
              key={user.id} 
              className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
            >
              <div className="rank">
                {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
              </div>
              <div className="user-info">
                <p className="user-name">{user.name}</p>
                <p className="user-stat">
                  {getIcon()} {user.value} {getValueLabel()}
                </p>
              </div>
              {user.isCurrentUser && <span className="you-badge">You</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
