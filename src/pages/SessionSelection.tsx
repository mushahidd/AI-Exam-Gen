import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import Toast from '../components/Toast';
import { CardGridSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, Trash2, Edit2 } from 'lucide-react';

interface Session {
    id: number;
    name: string;
    _count?: {
        exams: number;
    };
}

const SessionSelection = () => {
    const { classId, examType } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth() as any;
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
    const [sessionToEdit, setSessionToEdit] = useState<{ id: number; name: string } | null>(null);
    const [newSessionName, setNewSessionName] = useState('');
    const [editSessionName, setEditSessionName] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchSessions();
        fetchClassName();
    }, [classId]);

    const fetchClassName = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/classes/${classId}`);
            setClassName(res.data.name);
        } catch (error) {
            console.error("Failed to fetch class name", error);
        }
    };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/classes/${classId}/sessions`, {
                params: { type: examType }
            });
            setSessions(res.data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/sessions`, { name: newSessionName, classId });
            setNewSessionName('');
            setShowAddModal(false);
            fetchSessions();
            setToastMessage('Session created successfully!');
            setShowToast(true);
        } catch (error) {
            console.error("Failed to add session", error);
        }
    };

    const handleSelectSession = (sessionId: number) => {
        navigate(`/class/${classId}/${examType}/${sessionId}`);
    };

    const handleDeleteSession = async () => {
        if (!sessionToDelete) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/sessions/${sessionToDelete}`);
            setShowDeleteModal(false);
            setSessionToDelete(null);
            fetchSessions();
            setToastMessage('Session deleted successfully!');
            setShowToast(true);
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    };

    const handleEditSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionToEdit) return;
        try {
            await axios.put(`${API_BASE_URL}/api/sessions/${sessionToEdit.id}`, { name: editSessionName });
            setSessions(sessions.map(s => s.id === sessionToEdit.id ? { ...s, name: editSessionName } : s));
            setShowEditModal(false);
            setSessionToEdit(null);
            setEditSessionName('');
            setToastMessage('Session updated successfully!');
            setShowToast(true);
        } catch (error) {
            console.error("Failed to update session", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                <Breadcrumb items={[
                    { label: className || 'Class', href: `/class/${classId}` },
                    { label: examType || 'Exam Type' }
                ]} />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Select Session</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Choose the academic session for {examType} exams</p>
                    </div>
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                            Add Session
                        </button>
                    )}
                </div>

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fadeIn">
                        <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
                            <Calendar className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No sessions available</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {user?.role === 'ADMIN'
                                ? 'Get started by creating your first academic session.'
                                : 'Please contact your administrator to add sessions.'}
                        </p>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="text-indigo-600 font-medium hover:text-indigo-800"
                            >
                                Create your first session &rarr;
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map((session, index) => (
                            <div
                                key={session.id}
                                onClick={() => handleSelectSession(session.id)}
                                className={`group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fadeInUp stagger-${Math.min(index + 1, 6)}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <Calendar className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    {user?.role === 'ADMIN' && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSessionToEdit({ id: session.id, name: session.name });
                                                    setEditSessionName(session.name);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors p-1.5"
                                                title="Edit Session Name"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSessionToDelete(session.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors p-1.5"
                                                title="Delete Session"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{session.name}</h2>
                                <p className="text-gray-500 text-sm">
                                    {session._count?.exams || 0} Exams
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Session Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all scale-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Session</h2>
                            <p className="text-gray-500 mb-6">Enter the name of the academic session.</p>
                            <form onSubmit={handleAddSession}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        placeholder="e.g., 2023-2024"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Add Session
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Session Modal */}
                {showEditModal && sessionToEdit && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all scale-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Session Name</h2>
                            <p className="text-gray-500 mb-6">Update the name of this session.</p>
                            <form onSubmit={handleEditSession}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        value={editSessionName}
                                        onChange={(e) => setEditSessionName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSessionToEdit(null);
                                        }}
                                        className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Update Name
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all scale-100">
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-red-100 p-4 rounded-full">
                                    <Trash2 className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Delete Session?</h2>
                            <p className="text-gray-500 mb-8 text-center">
                                Are you sure you want to delete this session? All associated subjects and exams will also be removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSessionToDelete(null);
                                    }}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={handleDeleteSession}
                                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {showToast && (
                    <Toast
                        message={toastMessage}
                        onClose={() => setShowToast(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default SessionSelection;
