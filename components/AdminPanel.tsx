import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

export const AdminPanel: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newAdminPass, setNewAdminPass] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshUsers = async () => {
    setLoading(true);
    const all = await authService.getAllUsers();
    setUsers(all);
    setLoading(false);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleUpdateAdminPassword = async () => {
    if (!newAdminPass) return;
    try {
      await authService.updateUserPassword(currentUser.id, newAdminPass);
      setNewAdminPass('');
      setSuccessMsg('Your password has been updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Error updating password.");
    }
  };

  const handleResetUserPassword = async (email: string) => {
    if (window.confirm(`Send password reset email to ${email}?`)) {
      await authService.sendPasswordReset(email);
      alert("Password reset email sent.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this user from the application view? (This does not delete the Auth account due to security permissions)")) {
      await authService.deleteUser(id);
      refreshUsers();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Profile Section */}
      <div className="bg-crypto-panel p-6 rounded-lg border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Admin Security</h2>
        <div className="max-w-md">
          <label className="block text-gray-400 text-xs mb-1">Update My Password</label>
          <div className="flex gap-2">
            <input 
              type="password"
              value={newAdminPass}
              onChange={(e) => setNewAdminPass(e.target.value)}
              placeholder="New password"
              className="flex-1 bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
            />
            <button 
              onClick={handleUpdateAdminPassword}
              className="bg-crypto-accent text-black font-bold px-4 py-2 rounded hover:bg-yellow-400"
            >
              Update
            </button>
          </div>
          {successMsg && <p className="text-crypto-green text-xs mt-2">{successMsg}</p>}
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-crypto-panel p-6 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            User Management (Supabase DB)
            {loading && <span className="text-xs text-crypto-accent animate-pulse">Loading...</span>}
          </h2>
          <button onClick={refreshUsers} className="text-xs text-crypto-accent hover:underline">Refresh List</button>
        </div>
        
        {users.length === 0 && !loading && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 text-sm mb-4">
             <strong>Setup Required:</strong> No users found. You likely need to run the SQL script in the "Deploy / DB" tab to create the `profiles` table in Supabase.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-[#0b0e11] uppercase">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Email / Username</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-mono text-gray-500 text-xs">{u.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 font-bold text-white">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs border ${u.role === 'admin' ? 'border-crypto-accent text-crypto-accent bg-crypto-accent/10' : 'border-gray-600 text-gray-400'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {u.role !== 'admin' && (
                      <>
                        <button 
                          onClick={() => handleResetUserPassword(u.email)}
                          className="text-blue-400 hover:text-blue-300 text-xs border border-blue-900 bg-blue-900/20 px-2 py-1 rounded"
                        >
                          Send Reset Email
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-crypto-red hover:text-red-400 text-xs border border-red-900 bg-red-900/20 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {u.role === 'admin' && <span className="text-gray-600 text-xs italic">Protected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};