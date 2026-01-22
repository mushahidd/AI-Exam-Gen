import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Shield, Calendar, ArrowLeft, Trash2, Key } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    createdAt: string;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [userToDelete, setUserToDelete] = useState<{ id: number, username: string } | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    // Auto dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUsers(res.data);
            setError('');
        } catch (error: any) {
            console.error('Failed to fetch users', error);
            setError('Failed to load users. Please make sure you are logged in as an admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (userId: number, username: string) => {
        setUserToDelete({ id: userId, username });
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/users/${userToDelete.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setToast({ message: 'User deleted successfully!', type: 'success' });
            fetchUsers();
            setUserToDelete(null);
        } catch (error) {
            console.error('Failed to delete user', error);
            setToast({ message: 'Failed to delete user. Please try again.', type: 'error' });
            setUserToDelete(null);
        }
    };



    const handlePasswordUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
            setToast({ message: 'Password must be at least 6 characters long', type: 'error' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/users/${selectedUserId}/password`,
                { password: newPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setToast({ message: 'Password updated successfully!', type: 'success' });
            setShowPasswordModal(false);
            setNewPassword('');
            setSelectedUserId(null);
        } catch (error) {
            console.error('Failed to update password', error);
            setToast({ message: 'Failed to update password. Please try again.', type: 'error' });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all animate-fade-in ${toast.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {toast.type === 'success' ? (
                        <Shield className="w-5 h-5" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold">!</div>
                    )}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                {/* ... existing content ... */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-600 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium">Back to Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="h-8 w-8 text-indigo-600" />
                            User Management
                        </h1>
                        <p className="text-gray-500 mt-1">View and manage all registered users</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl">
                        <p className="text-sm text-indigo-600 font-medium">Total Users: {users.length}</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800 text-sm">{error}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <p className="text-gray-500">Loading users...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Password
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Registered On
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-900">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Key className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-gray-500 font-mono">••••••••</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserId(user.id);
                                                            setShowPasswordModal(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Change Password"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                        disabled={user.role === 'ADMIN'}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No users found</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">
                        <strong>Security Note:</strong> Passwords are securely hashed in the database and cannot be displayed in plain text.
                        This is a security best practice to protect user accounts.
                    </p>
                </div>
            </div>

            {/* Password Update Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl transform transition-all scale-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Key className="h-6 w-6 text-indigo-600" />
                            Update Password
                        </h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                placeholder="Enter new password (min 6 characters)"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setNewPassword('');
                                    setSelectedUserId(null);
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordUpdate}
                                className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-200"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete User?</h2>
                            <p className="text-gray-500">
                                Are you sure you want to delete <span className="font-semibold text-gray-900">{userToDelete.username}</span>?
                            </p>
                            <p className="text-sm text-red-500 mt-2 bg-red-50 px-3 py-1 rounded-lg">
                                This action cannot be undone. All associated data will be removed.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Yes, Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
