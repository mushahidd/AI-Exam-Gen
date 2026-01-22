import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import Toast from '../components/Toast';
import { Search, Filter, Edit2, Trash2, X, Save, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Question {
    id: number;
    text: string;
    type: string;
    options?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
    unit?: string;
    className?: string;
    answer?: string;
    createdAt: string;
    updatedAt: string;
}

const QuestionBankManagement = () => {
    const { user } = useAuth() as any;
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        className: '',
        subject: '',
        chapter: '',
        type: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Edit Modal State
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Delete Confirmation State
    const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Access Control
    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [questions, searchTerm, filters]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/question-bank`);
            setQuestions(res.data);
        } catch (error) {
            console.error('Failed to fetch questions', error);
            setToastMessage('❌ Failed to load question bank');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...questions];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(q =>
                q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.chapter?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Dropdown filters
        if (filters.className) {
            filtered = filtered.filter(q => q.className === filters.className);
        }
        if (filters.subject) {
            filtered = filtered.filter(q => q.subject?.toLowerCase().includes(filters.subject.toLowerCase()));
        }
        if (filters.chapter) {
            filtered = filtered.filter(q => q.chapter === filters.chapter);
        }
        if (filters.type) {
            filtered = filtered.filter(q => q.type === filters.type);
        }

        setFilteredQuestions(filtered);
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion({ ...question });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingQuestion) return;

        try {
            const payload = {
                text: editingQuestion.text,
                type: editingQuestion.type,
                options: editingQuestion.options,
                subject: editingQuestion.subject,
                chapter: editingQuestion.chapter,
                topic: editingQuestion.topic || editingQuestion.unit
            };

            await axios.put(`${API_BASE_URL}/api/question-bank/${editingQuestion.id}`, payload);
            
            setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
            setToastMessage('✅ Question updated successfully');
            setShowEditModal(false);
            setEditingQuestion(null);
        } catch (error) {
            console.error('Failed to update question', error);
            setToastMessage('❌ Failed to update question');
        }
    };

    const handleDeleteClick = (questionId: number) => {
        setDeletingQuestionId(questionId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingQuestionId) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/question-bank/${deletingQuestionId}`);
            setQuestions(questions.filter(q => q.id !== deletingQuestionId));
            setToastMessage('✅ Question deleted successfully');
            setShowDeleteModal(false);
            setDeletingQuestionId(null);
        } catch (error) {
            console.error('Failed to delete question', error);
            setToastMessage('❌ Failed to delete question');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ className: '', subject: '', chapter: '', type: '' });
    };

    const parseOptions = (optionsStr?: string): string[] => {
        if (!optionsStr) return [];
        try {
            return JSON.parse(optionsStr);
        } catch {
            return [];
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            {toastMessage && (
                <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                <Breadcrumb items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Question Bank Management' }
                ]} />

                <div className="mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
                            <Database className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">Question Bank</h1>
                            <p className="text-gray-500 mt-1 text-lg">Manage and organize your question repository</p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900">Filters & Search</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search questions, subjects, chapters..."
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Class Filter */}
                        <select
                            className="px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            value={filters.className}
                            onChange={(e) => setFilters({ ...filters, className: e.target.value })}
                        >
                            <option value="">All Classes</option>
                            <option value="IX">Class IX</option>
                            <option value="X">Class X</option>
                            <option value="XI">Class XI</option>
                            <option value="XII">Class XII</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            className="px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">All Types</option>
                            <option value="MCQ">MCQ</option>
                            <option value="SHORT">Short Answer</option>
                            <option value="LONG">Long Answer</option>
                        </select>

                        {/* Clear Filters */}
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white">
                        <div className="text-3xl font-black">{filteredQuestions.length}</div>
                        <div className="text-sm font-medium opacity-90 mt-1">Total Questions</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-3xl shadow-lg text-white">
                        <div className="text-3xl font-black">{filteredQuestions.filter(q => q.type === 'MCQ').length}</div>
                        <div className="text-sm font-medium opacity-90 mt-1">MCQ Questions</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-3xl shadow-lg text-white">
                        <div className="text-3xl font-black">{filteredQuestions.filter(q => q.type === 'SHORT').length}</div>
                        <div className="text-sm font-medium opacity-90 mt-1">Short Questions</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl shadow-lg text-white">
                        <div className="text-3xl font-black">{filteredQuestions.filter(q => q.type === 'LONG').length}</div>
                        <div className="text-sm font-medium opacity-90 mt-1">Long Questions</div>
                    </div>
                </div>

                {/* Questions Table */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="text-center py-20">
                                <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No Questions Found</h3>
                                <p className="text-gray-400 mt-2">Try adjusting your filters or add new questions</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Question</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Chapter</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredQuestions.map((question, idx) => (
                                        <tr key={question.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="max-w-md">
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{question.text}</p>
                                                    {question.type === 'MCQ' && parseOptions(question.options).length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {parseOptions(question.options).slice(0, 2).map((opt, i) => (
                                                                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                                                                    {String.fromCharCode(65 + i)}: {opt.substring(0, 20)}{opt.length > 20 ? '...' : ''}
                                                                </span>
                                                            ))}
                                                            {parseOptions(question.options).length > 2 && (
                                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                                                                    +{parseOptions(question.options).length - 2} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase ${
                                                    question.type === 'MCQ' ? 'bg-blue-100 text-blue-700' :
                                                    question.type === 'SHORT' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {question.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-gray-700">{question.className || '-'}</td>
                                            <td className="px-6 py-5 text-sm font-medium text-gray-600">{question.subject || '-'}</td>
                                            <td className="px-6 py-5 text-sm text-gray-600">{question.chapter || '-'}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(question)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Edit Question"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(question.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Question"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingQuestion && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Edit Question</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <X className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Question Text */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[100px]"
                                        value={editingQuestion.text}
                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Question Type</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={editingQuestion.type}
                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value })}
                                    >
                                        <option value="MCQ">MCQ</option>
                                        <option value="SHORT">Short Answer</option>
                                        <option value="LONG">Long Answer</option>
                                    </select>
                                </div>

                                {/* MCQ Options */}
                                {editingQuestion.type === 'MCQ' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Options (JSON Array)</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
                                            rows={4}
                                            value={editingQuestion.options || '[]'}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, options: e.target.value })}
                                            placeholder='["Option A", "Option B", "Option C", "Option D"]'
                                        />
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Class</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                                            value={editingQuestion.className || ''}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, className: e.target.value })}
                                        >
                                            <option value="">Not Specified</option>
                                            <option value="IX">Class IX</option>
                                            <option value="X">Class X</option>
                                            <option value="XI">Class XI</option>
                                            <option value="XII">Class XII</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                                            value={editingQuestion.subject || ''}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Chapter</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                                            value={editingQuestion.chapter || ''}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, chapter: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Unit/Topic</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                                            value={editingQuestion.topic || editingQuestion.unit || ''}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-5 w-5" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-red-100 p-4 rounded-full">
                                <AlertCircle className="h-12 w-12 text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 text-center mb-3">Delete Question?</h2>
                        <p className="text-gray-600 text-center mb-8">
                            This action cannot be undone. The question will be permanently removed from the question bank.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBankManagement;
