import { useState } from 'react';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfileHeader.css';

export default function ProfileHeader({ profile, onFollowChange }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(
    profile.followers?.includes(user?._id)
  );
  const [loading, setLoading] = useState(false);

  async function handleFollow() {
    setLoading(true);
    try {
      if (following) {
        await api.delete(`/users/${profile._id}/follow`);
        setFollowing(false);
      } else {
        await api.post(`/users/${profile._id}/follow`);
        setFollowing(true);
      }
      onFollowChange?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-header">
      <div className="profile-header__avatar">
        {profile.avatar
          ? <img src={profile.avatar} alt={profile.username} />
          : <div className="profile-header__avatar-placeholder">{profile.username?.[0]?.toUpperCase()}</div>
        }
      </div>
      <div className="profile-header__info">
        <h1>{profile.username}</h1>
        <div
          className="profile-header__bio"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(profile.bio || '<em>No bio yet.</em>') }}
        />
        <div className="profile-header__stats">
          <span>{profile.followers?.length ?? 0} followers</span>
          <span>{profile.following?.length ?? 0} following</span>
        </div>
        {user && user._id !== profile._id && (
          <button
            className={`profile-header__follow-btn${following ? ' profile-header__follow-btn--following' : ''}`}
            onClick={handleFollow}
            disabled={loading}
          >
            {following ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
}
