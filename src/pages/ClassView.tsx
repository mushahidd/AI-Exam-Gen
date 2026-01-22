import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import Toast from '../components/Toast';
import { CardGridSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText, Trash2, Eye, Edit, Edit2 } from 'lucide-react';

interface Exam {
    id: number;
    title: string;
    _count?: { questions: number };
}

const ClassView = () => {
    const { classId, examType, sessionId, subjectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth() as any;

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [newExamTitle, setNewExamTitle] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [examToDelete, setExamToDelete] = useState<number | null>(null);
    const [examToEdit, setExamToEdit] = useState<{ id: number; title: string } | null>(null);
    const [editExamTitle, setEditExamTitle] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [breadcrumbData, setBreadcrumbData] = useState({
        className: '',
        sessionName: '',
        subjectName: ''
    });

    useEffect(() => {
        fetchExams();
        fetchBreadcrumbData();
    }, [classId, examType, sessionId, subjectId]);

    const fetchBreadcrumbData = async () => {
        try {
            const [subjectRes, sessionRes, classRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/subjects/${subjectId}`),
                axios.get(`${API_BASE_URL}/api/sessions/${sessionId}`),
                axios.get(`${API_BASE_URL}/api/classes/${classId}`)
            ]);
            setBreadcrumbData({
                className: classRes.data.name,
                sessionName: sessionRes.data.name,
                subjectName: subjectRes.data.name
            });
        } catch (error) {
            console.error('Failed to fetch breadcrumb data', error);
        }
    };

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/classes/${classId}/exams?type=${examType}&sessionId=${sessionId}&subjectId=${subjectId}`
            );
            setExams(res.data);
        } catch (error) {
            console.error('Failed to fetch exams', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/exams`, {
                title: newExamTitle,
                classId,
                type: examType,
                sessionId,
                subjectId
            });
            setNewExamTitle('');
            setShowAddModal(false);
            fetchExams();
            setToastMessage('Exam created successfully!');
            setShowToast(true);
        } catch (error) {
            console.error('Failed to add exam', error);
        }
    };

    const handleDeleteExam = async () => {
        if (!examToDelete) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/exams/${examToDelete}`);
            setShowDeleteModal(false);
            setExamToDelete(null);
            fetchExams();
            setToastMessage('Exam deleted successfully!');
            setShowToast(true);
        } catch (error) {
            console.error('Failed to delete exam', error);
        }
    };

    const handleEditExamTitle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!examToEdit) return;
        try {
            await axios.put(`${API_BASE_URL}/api/exams/${examToEdit.id}`, { title: editExamTitle });
            setExams(exams.map(ex => ex.id === examToEdit.id ? { ...ex, title: editExamTitle } : ex));
            setShowEditModal(false);
            setExamToEdit(null);
            setEditExamTitle('');
            setToastMessage('Exam title updated successfully!');
            setShowToast(true);
        } catch (error) {
            console.error('Failed to update exam title', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                {breadcrumbData.className && (
                    <Breadcrumb
                        items={[
                            { label: breadcrumbData.className, href: `/class/${classId}` },
                            { label: examType || 'Exam Type', href: `/class/${classId}/${examType}` },
                            { label: breadcrumbData.sessionName, href: `/class/${classId}/${examType}/${sessionId}` },
                            { label: breadcrumbData.subjectName }
                        ]}
                    />
                )}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                            {breadcrumbData.className && breadcrumbData.sessionName && breadcrumbData.subjectName
                                ? `${breadcrumbData.subjectName} Exams`
                                : 'Exams'}
                        </h1>
                        <p className="text-gray-500 text-sm sm:text-base">Manage and create exams for this subject</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                        Create Exam
                    </button>
                </div>

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : exams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fadeIn">
                        <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
                            <FileText className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No exams yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Get started by creating your first exam for this class.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-indigo-600 font-medium hover:text-indigo-800"
                        >
                            Create your first exam &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map((exam, index) => (
                            <div
                                key={exam.id}
                                className={`group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between h-full opacity-0 animate-fadeInUp stagger-${Math.min(index + 1, 6)}`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                            <FileText className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        {user?.role === 'ADMIN' && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setExamToEdit({ id: exam.id, title: exam.title });
                                                        setEditExamTitle(exam.title);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors p-1.5"
                                                    title="Edit Exam Title"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setExamToDelete(exam.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors p-1.5"
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h2>
                                    <p className="text-gray-500 text-sm mb-4">
                                        {exam._count?.questions || 0} Questions
                                    </p>
                                </div>
                                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                                    <Link
                                        to={`/class/${classId}/${examType}/${sessionId}/${subjectId}/create-exam?examId=${exam.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    <Link
                                        to={`/exam/${exam.id}/preview`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all scale-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Exam</h2>
                            <p className="text-gray-500 mb-6">Enter a title for your new exam to get started.</p>
                            <form onSubmit={handleAddExam}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        placeholder="e.g., Mid-Term Physics"
                                        value={newExamTitle}
                                        onChange={(e) => setNewExamTitle(e.target.value)}
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
                                        Create Exam
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Exam Title Modal */}
                {showEditModal && examToEdit && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all scale-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Exam Title</h2>
                            <p className="text-gray-500 mb-6">Update the title for this exam.</p>
                            <form onSubmit={handleEditExamTitle}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        value={editExamTitle}
                                        onChange={(e) => setEditExamTitle(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setExamToEdit(null);
                                        }}
                                        className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Update Title
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Delete Exam?</h2>
                            <p className="text-gray-500 mb-8 text-center">
                                Are you sure you want to delete this exam? This action cannot be undone and all associated questions will be permanently removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setExamToDelete(null);
                                    }}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    No, Cancel
                                </button>
                                <button
                                    onClick={handleDeleteExam}
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
                    <Toast message={toastMessage} onClose={() => setShowToast(false)} />
                )}
            </div>
        </div>
    );
};

export default ClassView;
