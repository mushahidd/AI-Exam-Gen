import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { CardGridSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Plus, BookOpen, GraduationCap, Users, Upload, Database, Edit2 } from 'lucide-react';

const Dashboard = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newClassName, setNewClassName] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [classToDelete, setClassToDelete] = useState<number | null>(null);
    const [classToEdit, setClassToEdit] = useState<{ id: number; name: string } | null>(null);
    const [editClassName, setEditClassName] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const { user } = useAuth() as any;
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/classes`);
            setClasses(res.data);
        } catch (error) {
            console.error("Failed to fetch classes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/classes`, { name: newClassName });
            setNewClassName('');
            setShowAddModal(false);
            fetchClasses();
            setToastMessage('Class created successfully!');
            setShowToast(true);
        } catch (error) {
            console.error("Failed to add class", error);
        }
    };

    const handleDeleteClass = (e: React.MouseEvent, classId: number) => {
        e.preventDefault(); // Prevent navigation
        setClassToDelete(classId);
        setShowDeleteModal(true);
    };

    const handleEditClass = (e: React.MouseEvent, classId: number, className: string) => {
        e.preventDefault(); // Prevent navigation
        setClassToEdit({ id: classId, name: className });
        setEditClassName(className);
        setShowEditModal(true);
    };

    const confirmEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classToEdit) return;

        try {
            await axios.put(`${API_BASE_URL}/api/classes/${classToEdit.id}`, { name: editClassName });
            setClasses(classes.map(c => c.id === classToEdit.id ? { ...c, name: editClassName } : c));
            setToastMessage('Class name updated successfully');
            setShowToast(true);
            setShowEditModal(false);
            setClassToEdit(null);
            setEditClassName('');
        } catch (error) {
            console.error("Failed to update class", error);
            alert('Failed to update class name');
        }
    };

    const confirmDelete = async () => {
        if (!classToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/classes/${classToDelete}`);
            setClasses(classes.filter(c => c.id !== classToDelete));
            setToastMessage('Class deleted successfully');
            setShowToast(true);
            setShowDeleteModal(false);
            setClassToDelete(null);
        } catch (error) {
            console.error("Failed to delete class", error);
            alert('Failed to delete class');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="text-center md:text-left w-full md:w-auto">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Classes</h1>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your classes and question papers</p>
                    </div>
                    {user?.role === 'ADMIN' && (
                        <div className="w-full md:w-auto overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="flex gap-2 sm:gap-3 min-w-max md:min-w-0 md:flex-wrap md:justify-end">
                                <button
                                    onClick={() => navigate('/manage-users')}
                                    className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-full font-medium text-sm sm:text-base shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                                    <span className="hidden xs:inline">Manage</span> Users
                                </button>
                                <button
                                    onClick={() => navigate('/admin/question-bank')}
                                    className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-full font-medium text-sm sm:text-base shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    <Database className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                                    Question Bank
                                </button>
                                <button
                                    onClick={() => navigate('/admin/upload')}
                                    className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-full font-medium text-sm sm:text-base shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                                    Import
                                </button>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-full font-medium text-sm sm:text-base shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                                    <span className="hidden xs:inline">Create</span> New
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : classes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fadeIn">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No classes available</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {user?.role === 'ADMIN'
                                ? 'Create your first class to start organizing exams.'
                                : 'Please contact your administrator to add classes.'}
                        </p>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="text-indigo-600 font-medium hover:text-indigo-800"
                            >
                                + Create Class
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls, index) => (
                            <Link to={`/class/${cls.id}`} key={cls.id} className={`group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1 relative opacity-0 animate-fadeInUp stagger-${Math.min(index + 1, 6)}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    {user?.role === 'ADMIN' && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => handleEditClass(e, cls.id, cls.name)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors z-10"
                                                title="Edit Class Name"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClass(e, cls.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                                                title="Delete Class"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{cls.name}</h2>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                        {cls._count?.exams || 0} Exams
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Click to manage exams and generate new papers for this class.
                                </p>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Edit Class Modal */}
                {showEditModal && classToEdit && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">Edit Class Name</h2>
                            <p className="text-gray-500 mb-6">Update the name for this class.</p>

                            <form onSubmit={confirmEdit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                                    <input
                                        type="text"
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                                        value={editClassName}
                                        onChange={(e) => setEditClassName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                                        Update Class
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Class Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">Add New Class</h2>
                            <p className="text-gray-500 mb-6">Enter the details for your new class.</p>

                            <form onSubmit={handleAddClass}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                                    <input
                                        type="text"
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                                        placeholder="e.g., Class X - Science"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
                                        Create Class
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">Delete Class</h2>
                            <p className="text-gray-500 mb-6">Are you sure you want to delete this class? All associated data will be lost.</p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
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

export default Dashboard;
