import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import Toast from '../components/Toast';
import { Plus, FileText, CheckCircle, Settings, Filter, Trash2, ChevronRight, Sparkles, X, Send, Bot } from 'lucide-react';

interface Question {
    id?: number;
    text: string;
    type: string;
    examId?: number;
    options?: string; // JSON string
}

interface BankQuestion {
    id: number;
    text: string;
    type: string;
    options?: string;
    subject?: string;
    chapter?: string;
    unit?: string;
    className?: string;
}

interface Exam {
    id: number;
    title: string;
    questions?: Question[];
    time?: string;
    date?: string;
    maxMarks?: string;
    sectionAMarks?: string;
    sectionBMarks?: string;
    sectionCMarks?: string;
    subjectId?: number;
    examType?: string;
}

const CreateExam = () => {
    const [searchParams] = useSearchParams();
    const examId = searchParams.get('examId');
    const navigate = useNavigate();

    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [newQuestion, setNewQuestion] = useState({ text: '', type: 'MCQ', options: [] as string[] });
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Question Bank State
    const [activeTab, setActiveTab] = useState<'MANUAL' | 'BANK' | 'AI'>('MANUAL');
    const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
    const [selectedBankIds, setSelectedBankIds] = useState<number[]>([]);

    // Teacher AI State
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<any[]>([]);
    const [aiFields, setAiFields] = useState({
        className: 'IX',
        subject: '',
        instruction: '',
        chapter: '', // These will be inferred but keeping fields in state for API compatibility
        unit: '',
        questionType: 'MCQ',
        count: 5
    });

    const [bankFilters, setBankFilters] = useState({
        subject: '',
        chapter: '',
        unit: '',
        className: '',
        type: ''
    });
    const [isLoadingBank, setIsLoadingBank] = useState(false);

    // Breadcrumb state
    const [breadcrumbData, setBreadcrumbData] = useState({
        className: '',
        examType: '',
        sessionName: '',
        subjectName: '',
        classId: '',
        sessionId: '',
        subjectId: ''
    });

    // Exam Details State
    const [examDetails, setExamDetails] = useState({
        time: '60',
        date: new Date().toISOString().split('T')[0],
        maxMarks: '30',
        sectionAMarks: '2',
        sectionBMarks: '12',
        sectionCMarks: '10'
    });
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    useEffect(() => {
        if (examId) {
            fetchExam();
        }
    }, [examId]);

    // Update AI fields when breadcrumb data is loaded
    useEffect(() => {
        if (breadcrumbData.className || breadcrumbData.subjectName) {
            setAiFields(prev => ({
                ...prev,
                className: breadcrumbData.className || prev.className,
                subject: breadcrumbData.subjectName || prev.subject
            }));
        }
    }, [breadcrumbData]);

    const handleClearAI = () => {
        setAiGeneratedQuestions([]);
        setAiFields(prev => ({ ...prev, instruction: '' }));
    };

    const handleGenerateAI = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGeneratingAI(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/ai/teacher-generate`, aiFields, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Replace generated questions for new ones
            setAiGeneratedQuestions([...res.data.questions]);
            setToastMessage(`Generated ${res.data.questions.length} questions!`);
            // Clear the instruction after successful generation
            setAiFields(prev => ({ ...prev, instruction: '' }));
        } catch (error: any) {
            console.error("AI Generation failed", error);
            setToastMessage(error.response?.data?.error || "AI failed to generate questions");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleAddAIQuestion = async (q: any, index: number) => {
        try {
            const payload: any = {
                text: q.question || q.text,
                type: q.type,
                examId,
            };
            if (q.type === 'MCQ' && q.options) {
                payload.options = q.options;
            }
            const res = await axios.post(`${API_BASE_URL}/api/questions`, payload);
            setQuestions([...questions, res.data]);

            // Remove from generated list
            const updated = [...aiGeneratedQuestions];
            updated.splice(index, 1);
            setAiGeneratedQuestions(updated);

            setToastMessage('Question added to exam');
        } catch (error) {
            console.error("Failed to add AI question", error);
            setToastMessage('Failed to add question');
        }
    };

    const handleUpdateAIQuestionText = (index: number, newText: string) => {
        const updated = [...aiGeneratedQuestions];
        updated[index].question = newText;
        setAiGeneratedQuestions(updated);
    };

    // Fetch bank questions when tab or filters change
    useEffect(() => {
        if (activeTab === 'BANK') {
            fetchBankQuestions();
        }
    }, [activeTab, bankFilters]);

    const fetchBankQuestions = async () => {
        setIsLoadingBank(true);
        try {
            const params = new URLSearchParams();
            if (bankFilters.subject) params.append('subject', bankFilters.subject);
            if (bankFilters.chapter) params.append('chapter', bankFilters.chapter);
            if (bankFilters.unit) params.append('unit', bankFilters.unit);
            if (bankFilters.className) params.append('className', bankFilters.className);
            if (bankFilters.type) params.append('type', bankFilters.type);

            const res = await axios.get(`${API_BASE_URL}/api/question-bank?${params.toString()}`);
            setBankQuestions(res.data);
        } catch (error) {
            console.error("Failed to fetch bank questions", error);
        } finally {
            setIsLoadingBank(false);
        }
    };

    const fetchExam = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/exams/${examId}`);
            setExam(res.data);
            setQuestions(res.data.questions || []);

            const extractNumber = (str: string | undefined, defaultVal: string) => {
                if (!str) return defaultVal;
                const match = str.match(/(\d+)/);
                return match ? match[0] : defaultVal;
            };

            setExamDetails({
                time: extractNumber(res.data.time, '60'),
                date: res.data.date || new Date().toISOString().split('T')[0],
                maxMarks: extractNumber(res.data.maxMarks, '30'),
                sectionAMarks: extractNumber(res.data.sectionAMarks, '2'),
                sectionBMarks: extractNumber(res.data.sectionBMarks, '12'),
                sectionCMarks: extractNumber(res.data.sectionCMarks, '10')
            });

            if (res.data.subjectId) {
                const subjectRes = await axios.get(`${API_BASE_URL}/api/subjects/${res.data.subjectId}`);
                const sessionRes = await axios.get(`${API_BASE_URL}/api/sessions/${subjectRes.data.sessionId}`);
                const classRes = await axios.get(`${API_BASE_URL}/api/classes/${sessionRes.data.classId}`);

                setBreadcrumbData({
                    className: classRes.data.name,
                    examType: res.data.examType,
                    sessionName: sessionRes.data.name,
                    subjectName: subjectRes.data.name,
                    classId: classRes.data.id,
                    sessionId: sessionRes.data.id,
                    subjectId: subjectRes.data.id
                });

                // Pre-fill subject filter if available
                if (subjectRes.data.name && !bankFilters.subject) {
                    setBankFilters(prev => ({ ...prev, subject: subjectRes.data.name }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch exam", error);
        }
    };

    const handleSaveDetails = async () => {
        setIsSavingDetails(true);
        try {
            await axios.put(`${API_BASE_URL}/api/exams/${examId}`, examDetails);
            setToastMessage('Exam details saved successfully!');
        } catch (error) {
            console.error("Failed to save exam details", error);
            alert('Failed to save details');
        } finally {
            setIsSavingDetails(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                text: newQuestion.text,
                type: newQuestion.type,
                examId,
            };
            if (newQuestion.type === 'MCQ' && newQuestion.options.length > 0) {
                payload.options = newQuestion.options;
            }
            const res = await axios.post(`${API_BASE_URL}/api/questions`, payload);
            setQuestions([...questions, res.data]);
            setNewQuestion({ text: '', type: 'MCQ', options: [] });
            setToastMessage('Question added successfully');
        } catch (error) {
            console.error("Failed to add question", error);
        }
    };

    const handleAddBankQuestions = async () => {
        if (selectedBankIds.length === 0) return;

        try {
            let addedCount = 0;
            for (const id of selectedBankIds) {
                const bankQ = bankQuestions.find(q => q.id === id);
                if (!bankQ) continue;

                const payload: any = {
                    text: bankQ.text,
                    type: bankQ.type,
                    examId
                };

                if (bankQ.type === 'MCQ' && bankQ.options) {
                    try {
                        const parsedOpts = typeof bankQ.options === 'string' ? JSON.parse(bankQ.options) : bankQ.options;
                        payload.options = parsedOpts;
                    } catch (e) {
                        payload.options = [];
                    }
                }

                const res = await axios.post(`${API_BASE_URL}/api/questions`, payload);
                setQuestions(prev => [...prev, res.data]);
                addedCount++;
            }

            setToastMessage(`${addedCount} questions added from bank`);
            setSelectedBankIds([]);
        } catch (error) {
            console.error("Failed to add bank questions", error);
            setToastMessage("Error adding some questions");
        }
    };

    const toggleBankSelection = (id: number) => {
        if (selectedBankIds.includes(id)) {
            setSelectedBankIds(selectedBankIds.filter(sid => sid !== id));
        } else {
            setSelectedBankIds([...selectedBankIds, id]);
        }
    };

    const handleDeleteQuestion = async (questionId: number) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/questions/${questionId}`);
            setQuestions(questions.filter(q => q.id !== questionId));
            setToastMessage('Question deleted successfully');
        } catch (error) {
            console.error("Failed to delete question", error);
        }
    };

    const getQuestionsBySection = (type: string) => {
        return questions.filter(q => q.type === type);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                {breadcrumbData.className && (
                    <Breadcrumb items={[
                        { label: breadcrumbData.className, href: `/class/${breadcrumbData.classId}` },
                        { label: breadcrumbData.examType, href: `/class/${breadcrumbData.classId}/${breadcrumbData.examType}` },
                        { label: breadcrumbData.sessionName, href: `/class/${breadcrumbData.classId}/${breadcrumbData.examType}/${breadcrumbData.sessionId}` },
                        { label: breadcrumbData.subjectName, href: `/class/${breadcrumbData.classId}/${breadcrumbData.examType}/${breadcrumbData.sessionId}/${breadcrumbData.subjectId}` },
                        { label: exam?.title || 'Edit Exam' }
                    ]} />
                )}

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{exam?.title || 'Edit Exam'}</h1>
                        <p className="text-gray-500 mt-1">Class {breadcrumbData.className} • {breadcrumbData.subjectName}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/exam/${examId}/preview`)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-bold"
                        >
                            <FileText className="h-5 w-5" />
                            Preview Exam
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* LEFT SIDEBAR: Exam Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-32">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-50 p-2 rounded-xl">
                                    <Settings className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Exam Details</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Time (Mins)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                                        value={examDetails.time}
                                        onChange={(e) => setExamDetails({ ...examDetails, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                                        value={examDetails.date}
                                        onChange={(e) => setExamDetails({ ...examDetails, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max Marks</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                                        value={examDetails.maxMarks}
                                        onChange={(e) => setExamDetails({ ...examDetails, maxMarks: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Section Marks</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <input
                                                type="number"
                                                className="w-full px-2 py-2 rounded-lg border border-gray-200 text-center text-sm font-bold focus:ring-indigo-500 bg-gray-50"
                                                value={examDetails.sectionAMarks}
                                                onChange={(e) => setExamDetails({ ...examDetails, sectionAMarks: e.target.value })}
                                            />
                                            <span className="block text-[10px] text-center text-gray-500 mt-1">Sec A</span>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                className="w-full px-2 py-2 rounded-lg border border-gray-200 text-center text-sm font-bold focus:ring-indigo-500 bg-gray-50"
                                                value={examDetails.sectionBMarks}
                                                onChange={(e) => setExamDetails({ ...examDetails, sectionBMarks: e.target.value })}
                                            />
                                            <span className="block text-[10px] text-center text-gray-500 mt-1">Sec B</span>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                className="w-full px-2 py-2 rounded-lg border border-gray-200 text-center text-sm font-bold focus:ring-indigo-500 bg-gray-50"
                                                value={examDetails.sectionCMarks}
                                                onChange={(e) => setExamDetails({ ...examDetails, sectionCMarks: e.target.value })}
                                            />
                                            <span className="block text-[10px] text-center text-gray-500 mt-1">Sec C</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveDetails}
                                    disabled={isSavingDetails}
                                    className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSavingDetails ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Update Details
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT: Current Questions Sections */}
                    <div className="lg:col-span-2 space-y-8">
                        {['MCQ', 'SHORT', 'LONG'].map((type) => (
                            <div key={type} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <div className={`w-2 h-8 rounded-full ${type === 'MCQ' ? 'bg-blue-500' : type === 'SHORT' ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
                                        {type === 'MCQ' ? 'Section A: Objective' : type === 'SHORT' ? 'Section B: Short Questions' : 'Section C: Long Questions'}
                                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                                            {getQuestionsBySection(type).length} Items
                                        </span>
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {getQuestionsBySection(type).map((q, idx) => (
                                        <div key={q.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 group relative hover:border-indigo-200 transition-all">
                                            <div className="flex gap-4">
                                                <span className="text-xs font-bold text-gray-300">#{idx + 1}</span>
                                                <div className="flex-1">
                                                    <p className="text-gray-900 font-medium leading-relaxed">{q.text}</p>
                                                    {q.type === 'MCQ' && q.options && (
                                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                                            {JSON.parse(q.options).map((opt: string, i: number) => (
                                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/50 px-3 py-2 rounded-xl">
                                                                    <span className="bg-white border border-gray-100 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-gray-400">{String.fromCharCode(65 + i)}</span>
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => q.id && handleDeleteQuestion(q.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {getQuestionsBySection(type).length === 0 && (
                                        <div className="py-8 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
                                            No questions added to this section yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT SIDEBAR: Add/Bank Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 sticky top-32 overflow-hidden flex flex-col max-h-[calc(100vh-10rem)]">
                            <div className="flex p-2 bg-gray-50 border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('MANUAL')}
                                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'MANUAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Manual
                                </button>
                                <button
                                    onClick={() => setActiveTab('BANK')}
                                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'BANK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Bank
                                </button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar p-6">
                                {activeTab === 'MANUAL' && (
                                    <form onSubmit={handleAddQuestion} className="space-y-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Section / Type</label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                                value={newQuestion.type}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value, options: [] })}
                                            >
                                                <option value="MCQ">Section A: MCQ</option>
                                                <option value="SHORT">Section B: Short</option>
                                                <option value="LONG">Section C: Long</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Question</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50 min-h-[100px]"
                                                placeholder="Type question text..."
                                                value={newQuestion.text}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                required
                                            />
                                        </div>
                                        {newQuestion.type === 'MCQ' && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Options (One per line)</label>
                                                <textarea
                                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                                    rows={4}
                                                    placeholder="Option A&#10;Option B..."
                                                    value={newQuestion.options.join('\n')}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value.split('\n') })}
                                                    required
                                                />
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                        >
                                            <Plus className="h-4 w-4" /> Add Question
                                        </button>
                                    </form>
                                )}

                                {activeTab === 'BANK' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 uppercase mb-1">
                                                <Filter className="h-3 w-3" /> Filters
                                            </div>
                                            <select
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:ring-indigo-500"
                                                value={bankFilters.className}
                                                onChange={(e) => setBankFilters({ ...bankFilters, className: e.target.value })}
                                            >
                                                <option value="">All Classes</option>
                                                <option value="IX">Class IX</option>
                                                <option value="X">Class X</option>
                                                <option value="XI">Class XI</option>
                                                <option value="XII">Class XII</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Subject"
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[10px] font-bold focus:ring-indigo-500"
                                                value={bankFilters.subject}
                                                onChange={(e) => setBankFilters({ ...bankFilters, subject: e.target.value })}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Chapter"
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[10px] font-bold focus:ring-indigo-500"
                                                    value={bankFilters.chapter}
                                                    onChange={(e) => setBankFilters({ ...bankFilters, chapter: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Unit / Topic"
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[10px] font-bold focus:ring-indigo-500"
                                                    value={bankFilters.unit}
                                                    onChange={(e) => setBankFilters({ ...bankFilters, unit: e.target.value })}
                                                />
                                            </div>
                                            <select
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[10px] font-bold focus:ring-indigo-500"
                                                value={bankFilters.type}
                                                onChange={(e) => setBankFilters({ ...bankFilters, type: e.target.value })}
                                            >
                                                <option value="">All Types</option>
                                                <option value="MCQ">MCQ (Sec A)</option>
                                                <option value="SHORT">Short (Sec B)</option>
                                                <option value="LONG">Long (Sec C)</option>
                                            </select>
                                        </div>

                                        <div className="max-h-[350px] overflow-y-auto space-y-2 px-1">
                                            {isLoadingBank ? (
                                                <div className="text-center py-10">
                                                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                    <span className="text-xs text-gray-400 font-bold">Scanning Bank...</span>
                                                </div>
                                            ) : bankQuestions.length === 0 ? (
                                                <div className="text-center py-10 text-gray-400 text-[10px] font-bold">
                                                    No questions match filters.
                                                </div>
                                            ) : (
                                                bankQuestions.map((q) => (
                                                    <div
                                                        key={q.id}
                                                        onClick={() => toggleBankSelection(q.id)}
                                                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedBankIds.includes(q.id)
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex gap-2 mb-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${selectedBankIds.includes(q.id) ? 'bg-white text-indigo-600' : 'bg-indigo-50 text-indigo-600'
                                                                }`}>
                                                                {q.type}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${selectedBankIds.includes(q.id) ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                                                                }`}>
                                                                {q.className} • {q.subject}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[11px] font-medium leading-relaxed ${selectedBankIds.includes(q.id) ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                                                            {q.text}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <button
                                            onClick={handleAddBankQuestions}
                                            disabled={selectedBankIds.length === 0}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-4 w-4" /> Import Selected ({selectedBankIds.length})
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'AI' as any && (
                                    <div className="py-20 text-center">
                                        <p className="text-gray-400 text-sm">AI Assistant has moved to the floating icon on the top-left!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FLOATING AI GEMINI ICON */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                        className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 transition-transform duration-700 active:scale-90"
                    >
                        <div className="relative group p-2">
                            {/* Permanent Dynamic Glow */}
                            <div className={`absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 transition-all duration-1000 ${isAIAssistantOpen ? 'bg-indigo-500/30' : 'animate-pulse'}`}></div>

                            {/* The Logo with Rolling Animation */}
                            <img
                                src="/ai-logo.png"
                                alt="AI Assist"
                                className={`h-20 w-20 relative object-contain transition-all duration-1000 ease-in-out cursor-pointer drop-shadow-[0_10px_20px_rgba(79,70,229,0.3)]
                                    ${isAIAssistantOpen ? 'rotate-[360deg] scale-110' : 'rotate-0 hover:scale-110 hover:-rotate-12'}`}
                            />
                        </div>
                    </button>

                    {/* AI ASSISTANT CHAT OVERLAY */}
                    {isAIAssistantOpen && (
                        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Shifu</h3>
                                        <p className="text-xs text-white/70">Intelligent Exam Assistant</p>
                                    </div>
                                </div>
                            </div>

                            {/* Minimal Context Info */}
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Class</label>
                                    <p className="text-xs font-bold text-indigo-600">{aiFields.className}</p>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject</label>
                                    <p className="text-xs font-bold text-indigo-600">{aiFields.subject}</p>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
                                    <p className="text-xs font-bold text-indigo-600">Online</p>
                                </div>
                            </div>

                            {/* Chat Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] bg-white custom-scrollbar">
                                {aiGeneratedQuestions.length === 0 && !isGeneratingAI ? (
                                    <div className="text-center py-10">
                                        <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Sparkles className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium px-6 leading-relaxed">
                                            "Hi! I'm Shifu. Tell me what subject and type of questions you need (e.g. 'MCQ' or 'Short questions'), and I'll generate them for you."
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {aiGeneratedQuestions.map((q, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">{q.type}</span>
                                                    <button onClick={() => {
                                                        const updated = [...aiGeneratedQuestions];
                                                        updated.splice(idx, 1);
                                                        setAiGeneratedQuestions(updated);
                                                    }} className="text-gray-300 hover:text-red-500">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="w-full text-sm font-medium text-gray-800 bg-transparent border-none p-0 focus:ring-0 resize-none min-h-[40px]"
                                                    value={q.question || q.text}
                                                    onChange={(e) => handleUpdateAIQuestionText(idx, e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleAddAIQuestion(q, idx)}
                                                    className="mt-3 w-full py-2 bg-white text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
                                                >
                                                    <Plus className="h-3 w-3" /> Add to Exam
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isGeneratingAI && (
                                    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl animate-pulse">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-400 ml-1">Shifuu is thinking...</span>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <form onSubmit={handleGenerateAI} className="relative">
                                    <textarea
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none overflow-hidden min-h-[50px]"
                                        placeholder="Type instructions (e.g. Chapter 5, 3 MCQ questions)..."
                                        value={aiFields.instruction}
                                        onChange={(e) => setAiFields({ ...aiFields, instruction: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleGenerateAI(e as any);
                                            }
                                        }}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isGeneratingAI || !aiFields.instruction}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-indigo-100 flex items-center justify-center"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI Detection: ACTIVATED</span>
                                    {aiGeneratedQuestions.length > 0 && (
                                        <button onClick={handleClearAI} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Clear</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateExam;
