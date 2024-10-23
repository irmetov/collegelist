import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, updatePassword, User } from 'firebase/auth';

export default function UserProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (user) {
        await updateProfile(user, { displayName });
        setSuccess('Profile updated successfully');
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (user) {
        await updatePassword(user, newPassword);
        setSuccess('Password changed successfully');
        setNewPassword('');
      }
    } catch (error) {
      setError('Failed to change password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <form onSubmit={handleUpdateProfile} className="mb-8">
        <div className="mb-4">
          <label htmlFor="displayName" className="block mb-2">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Update Profile
        </button>
      </form>

      <form onSubmit={handleChangePassword}>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block mb-2">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Change Password
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}