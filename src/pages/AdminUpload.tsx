import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import Toast from '../components/Toast';
import { Upload, FileText, AlertCircle, Trash2, Save, FileType, Sparkles, Loader2, BrainCircuit, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AIQuestion {
    text: string;
    type: string;
    options: string[];
    subject: string;
    chapter: string;
    unit: string;
    className: string;
}

const AdminUpload = () => {
    const { user } = useAuth() as any;
    const navigate = useNavigate();

    // UI State
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [extractionStage, setExtractionStage] = useState('');
    const [parsedQuestions, setParsedQuestions] = useState<AIQuestion[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Metadata for batch
    const [metadata, setMetadata] = useState({
        className: 'IX',
        subject: '',
        chapter: '',
        unit: ''
    });

    // Access control
    React.useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // File Handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setParsedQuestions([]);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const f = files[0];
            const ext = f.name.split('.').pop()?.toLowerCase();
            if (['pdf', 'docx', 'txt'].includes(ext || '')) {
                setFile(f);
                setParsedQuestions([]);
            } else {
                alert("Only PDF, DOCX, and TXT files are supported.");
            }
        }
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleUploadAndParse = async () => {
        if (!file) return;
        if (!metadata.subject || !metadata.chapter || !metadata.unit) {
            alert("Please provide Subject, Chapter, and Unit details.");
            return;
        }

        setIsUploading(true);
        setExtractionStage('Uploading file to secure server...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('className', metadata.className);
        formData.append('subject', metadata.subject);
        formData.append('chapter', metadata.chapter);
        formData.append('unit', metadata.unit);

        try {
            // Simulated progress stages
            const stages = [
                'Extracting text content from document...',
                'Processing text with AI brain...',
                'Generating structured question bank...'
            ];

            let stageIndex = 0;
            const stageInterval = setInterval(() => {
                if (stageIndex < stages.length) {
                    setExtractionStage(stages[stageIndex]);
                    stageIndex++;
                } else {
                    clearInterval(stageInterval);
                }
            }, 3000);

            const res = await axios.post(`${API_BASE_URL}/api/admin/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(stageInterval);

            if (res.data.success) {
                setParsedQuestions(res.data.questions);
                setToastMessage(`Success! AI generated ${res.data.count} questions.`);
            }
        } catch (error: any) {
            console.error('Upload Error:', error);
            const errMsg = error.response?.data?.error || error.message || 'Failed to extract questions.';
            alert(`Error: ${errMsg}`);
        } finally {
            setIsUploading(false);
            setExtractionStage('');
        }
    };

    const handleSaveBatch = async () => {
        if (parsedQuestions.length === 0) return;

        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/save`, {
                questions: parsedQuestions
            });

            if (res.data.success) {
                const { count, skipped } = res.data;
                let message = res.data.message;
                
                // Show detailed feedback
                if (count > 0 && skipped > 0) {
                    message = `✅ Saved ${count} new question(s). ⚠️ Skipped ${skipped} duplicate(s).`;
                } else if (count > 0) {
                    message = `✅ Successfully saved ${count} question(s) to the bank!`;
                } else if (skipped > 0) {
                    message = `⚠️ All questions are duplicates. No new questions added.`;
                }
                
                setToastMessage(message);
                
                // Only clear if at least one question was saved
                if (count > 0) {
                    setParsedQuestions([]);
                    setFile(null);
                }
            }
        } catch (error: any) {
            console.error(error);
            const errMsg = error.response?.data?.error || 'Failed to save to Question Bank.';
            alert(`Error: ${errMsg}`);
        }
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...parsedQuestions];
        newQuestions.splice(index, 1);
        setParsedQuestions(newQuestions);
    };

    const updateQuestionField = (index: number, field: keyof AIQuestion, value: any) => {
        const newQuestions = [...parsedQuestions];
        const updated = { ...newQuestions[index], [field]: value };
        newQuestions[index] = updated;
        setParsedQuestions(newQuestions);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            <Navbar />
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                <Breadcrumb items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'AI Importer' }
                ]} />

                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                        AI Question Importer
                        <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Harness artificial intelligence to turn documents into structured question banks.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEFT PANEL: CONFIG & UPLOAD */}
                    <div className="space-y-6">
                        {/* 1. Target Metadata */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-indigo-600" />
                                1. Target Environment
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Class Level</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all"
                                        value={metadata.className}
                                        onChange={(e) => setMetadata({ ...metadata, className: e.target.value })}
                                    >
                                        <option value="IX">Class IX</option>
                                        <option value="X">Class X</option>
                                        <option value="XI">Class XI</option>
                                        <option value="XII">Class XII</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Subject Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all placeholder:text-gray-300"
                                        placeholder="e.g. Computer Science"
                                        value={metadata.subject}
                                        onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Chapter No.</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all placeholder:text-gray-300"
                                            placeholder="e.g. 05"
                                            value={metadata.chapter}
                                            onChange={(e) => setMetadata({ ...metadata, chapter: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Unit/Topic</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition-all placeholder:text-gray-300"
                                            placeholder="e.g. Loops"
                                            value={metadata.unit}
                                            onChange={(e) => setMetadata({ ...metadata, unit: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. File Upload Dropzone */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <Upload className="h-5 w-5 text-indigo-600" />
                                2. Source Material
                            </h2>

                            <div
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                className={`
                                    border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer relative overflow-hidden
                                    ${file ? 'border-emerald-200 bg-emerald-50/50' : isDragging ? 'border-indigo-400 bg-indigo-50 scale-[0.98]' : 'border-gray-200 bg-gray-50 hover:border-indigo-300'}
                                `}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.docx,.txt"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer block">
                                    <div className={`w-16 h-16 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 transition-transform ${file ? 'bg-white text-emerald-500 rotate-12' : 'bg-white text-indigo-500'}`}>
                                        <FileType className="h-8 w-8" />
                                    </div>
                                    <p className="text-base font-black text-gray-900 truncate px-2">
                                        {file ? file.name : "Drop file or Browse"}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-tight">
                                        PDF, DOCX, or Text (Max 10MB)
                                    </p>
                                </label>

                                {isDragging && (
                                    <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center pointer-events-none">
                                        <p className="text-indigo-600 font-black text-xl animate-bounce">Release to Upload</p>
                                    </div>
                                )}
                            </div>

                            {file && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleUploadAndParse}
                                        disabled={isUploading}
                                        className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <BrainCircuit className="h-6 w-6" />}
                                        {isUploading ? 'AI is working...' : 'Run AI Extraction'}
                                    </button>

                                    {!isUploading && parsedQuestions.length > 0 && (
                                        <button
                                            onClick={handleUploadAndParse}
                                            className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Re-run AI (Different Results)
                                        </button>
                                    )}
                                </div>
                            )}

                            {isUploading && (
                                <div className="mt-6 space-y-4">
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 animate-progress origin-left"></div>
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{extractionStage}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {file && !isUploading && (
                            <button
                                onClick={() => setFile(null)}
                                className="w-full py-3 text-xs font-black text-gray-400 hover:text-red-500 flex items-center justify-center gap-2 group transition-colors"
                            >
                                <Trash2 className="h-4 w-4 group-hover:shake" />
                                REMOVE FILE
                            </button>
                        )}
                    </div>

                    {/* RIGHT PANEL: AI RESULTS REVIEW */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 flex flex-col h-[calc(100vh-14rem)] overflow-hidden">
                            {/* Header */}
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                        <FileText className="h-7 w-7 text-indigo-600" />
                                        Review Drafts
                                        {parsedQuestions.length > 0 && (
                                            <span className="bg-indigo-600 text-white text-[12px] px-3 py-1 rounded-full font-black">
                                                {parsedQuestions.length} Questions
                                            </span>
                                        )}
                                    </h2>
                                </div>
                                <button
                                    onClick={handleSaveBatch}
                                    disabled={parsedQuestions.length === 0}
                                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-base hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-100 disabled:opacity-20 disabled:grayscale flex items-center gap-3"
                                >
                                    <Save className="h-5 w-5" />
                                    Finalize Batch
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gray-50/20">
                                {parsedQuestions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-40">
                                        <div className="w-32 h-32 bg-gray-100 rounded-[40px] flex items-center justify-center mb-8 rotate-3">
                                            <BrainCircuit className="h-16 w-16 text-gray-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-400">The Brain is Idle</h3>
                                        <p className="max-w-xs mt-4 text-gray-400 font-bold leading-relaxed">Prepare the material on the left and click "Run AI Extraction" to see results here.</p>
                                    </div>
                                ) : (
                                    parsedQuestions.map((q, index) => (
                                        <div key={index} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative">
                                            {/* Question Badge */}
                                            <div className="absolute -left-4 top-10 w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-100 flex items-center justify-center text-lg font-black text-white transform -rotate-6">
                                                {index + 1}
                                            </div>

                                            <div className="flex flex-col gap-6 ml-4">
                                                <div className="flex justify-between items-start gap-6">
                                                    <div className="flex-1">
                                                        <textarea
                                                            className="w-full text-xl font-bold text-gray-900 border-none p-0 focus:ring-0 resize-none bg-transparent leading-relaxed placeholder:text-gray-200"
                                                            rows={2}
                                                            value={q.text}
                                                            onChange={(e) => updateQuestionField(index, 'text', e.target.value)}
                                                            placeholder="Enter question text..."
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeQuestion(index)}
                                                        className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                    >
                                                        <Trash2 className="h-6 w-6" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <select
                                                        className={`text-xs font-black px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer ${q.type === 'MCQ' ? 'bg-blue-600 text-white' :
                                                                q.type === 'SHORT' ? 'bg-emerald-600 text-white' :
                                                                    'bg-purple-600 text-white'
                                                            }`}
                                                        value={q.type}
                                                        onChange={(e) => updateQuestionField(index, 'type', e.target.value)}
                                                    >
                                                        <option value="MCQ">MCQ BATCH</option>
                                                        <option value="SHORT">SHORT ANSWER</option>
                                                        <option value="LONG">LONG ANSWER</option>
                                                    </select>

                                                    <span className="text-xs font-black px-4 py-2 rounded-xl bg-gray-100 text-gray-500 shadow-inner">
                                                        {q.className} • {q.subject}
                                                    </span>
                                                </div>

                                                {q.type === 'MCQ' && q.options && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                        {['A', 'B', 'C', 'D'].map((label, i) => (
                                                            <div key={i} className="flex items-center gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 focus-within:border-indigo-200 transition-all">
                                                                <span className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-gray-400 shadow-sm">
                                                                    {label}
                                                                </span>
                                                                <input
                                                                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-gray-700 focus:ring-0 placeholder:text-gray-300"
                                                                    value={q.options[i] || ''}
                                                                    placeholder={`Option ${label}...`}
                                                                    onChange={(e) => {
                                                                        const newOpts = [...q.options];
                                                                        newOpts[i] = e.target.value;
                                                                        updateQuestionField(index, 'options', newOpts);
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations in Style Tag */}
            <style>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.7); }
                    100% { transform: scaleX(0.9); }
                }
                .animate-progress {
                    animation: progress 10s ease-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default AdminUpload;
