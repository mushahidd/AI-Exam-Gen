import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import Toast from '../components/Toast';
import { CardGridSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Plus, BookOpen, Trash2, Edit2 } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    _count?: {
        exams: number;
    };
}

const SubjectSelection = () => {
    const { classId, examType, sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth() as any;
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null);
    const [subjectToEdit, setSubjectToEdit] = useState<{ id: number; name: string } | null>(null);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [editSubjectName, setEditSubjectName] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchSubjects();
        fetchClassName();
        fetchSessionName();
    }, [sessionId]);

    const fetchClassName = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/classes/${classId}`);
            setClassName(res.data.name);
        } catch (error) {
            console.error("Failed to fetch class name", error);
        }
    };

    const fetchSessionName = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}`);
            setSessionName(res.data.name);
        } catch (error) {
            console.error("Failed to fetch session name", error);
        }
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/subjects`, {
                params: { type: examType }
            });
            setSubjects(res.data);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/subjects`, { name: newSubjectName, sessionId });
            setNewSubjectName('');
            setShowAddModal(false);
            fetchSubjects();
            setToastMessage('Subject created successfully!');
            setShowToast(true);
        } catch (error) {
            console.error("Failed to add subject", error);
        }
    };

    const handleSelectSubject = (subjectId: number) => {
        navigate(`/class/${classId}/${examType}/${sessionId}/${subjectId}`);
    };

    const handleDeleteSubject = async () => {
        if (!subjectToDelete) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/subjects/${subjectToDelete}`);
            setShowDeleteModal(false);
            setSubjectToDelete(null);
            fetchSubjects();
            setToastMessage('Subject deleted successfully!');
            setShowToast(true);
        } catch (error) {
            console.error("Failed to delete subject", error);
        }
    };

    const handleEditSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectToEdit) return;
        try {
            await axios.put(`${API_BASE_URL}/api/subjects/${subjectToEdit.id}`, { name: editSubjectName });
            setSubjects(subjects.map(s => s.id === subjectToEdit.id ? { ...s, name: editSubjectName } : s));
            setShowEditModal(false);
            setSubjectToEdit(null);
            setEditSubjectName('');
            setToastMessage('Subject updated successfully!');
            setShowToast(true);
        } catch (error) {
            console.error("Failed to update subject", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                <Breadcrumb items={[
                    { label: className || 'Class', href: `/class/${classId}` },
                    { label: examType || 'Exam Type', href: `/class/${classId}/${examType}` },
                    { label: sessionName || 'Session' }
                ]} />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Select Subject</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Choose a subject for {examType} exams</p>
                    </div>
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                            Add Subject
                        </button>
                    )}
                </div>

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : subjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fadeIn">
                        <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
                            <BookOpen className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No subjects available</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {user?.role === 'ADMIN'
                                ? 'Get started by adding your first subject.'
                                : 'Please contact your administrator to add subjects.'}
                        </p>
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="text-indigo-600 font-medium hover:text-indigo-800"
                            >
                                Add your first subject &rarr;
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject, index) => (
                            <div
                                key={subject.id}
                                onClick={() => handleSelectSubject(subject.id)}
                                className={`group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fadeInUp stagger-${Math.min(index + 1, 6)}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <BookOpen className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    {user?.role === 'ADMIN' && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSubjectToEdit({ id: subject.id, name: subject.name });
                                                    setEditSubjectName(subject.name);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors p-1.5"
                                                title="Edit Subject Name"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSubjectToDelete(subject.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors p-1.5"
                                                title="Delete Subject"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{subject.name}</h2>
                                <p className="text-gray-500 text-sm">
                                    {subject._count?.exams || 0} Exams
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Subject Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all scale-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Subject</h2>
                            <p className="text-gray-500 mb-6">Enter the name of the subject.</p>
                            <form onSubmit={handleAddSubject}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        placeholder="e.g., Mathematics"
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
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
                                        Add Subject
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Subject Modal */}
                {showEditModal && subjectToEdit && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all scale-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Subject Name</h2>
                            <p className="text-gray-500 mb-6">Update the name of this subject.</p>
                            <form onSubmit={handleEditSubject}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        value={editSubjectName}
                                        onChange={(e) => setEditSubjectName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSubjectToEdit(null);
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Delete Subject?</h2>
                            <p className="text-gray-500 mb-8 text-center">
                                Are you sure you want to delete this subject? All associated exams will also be removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSubjectToDelete(null);
                                    }}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={handleDeleteSubject}
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

export default SubjectSelection;
