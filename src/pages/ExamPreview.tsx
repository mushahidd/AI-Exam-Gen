import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useReactToPrint } from 'react-to-print';
import Navbar from '../components/Navbar';
import { Printer, ArrowLeft } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    type: string;
    options?: string;
}

interface Exam {
    id: number;
    title: string;
    classId: string;
    questions: Question[];
    time?: string;
    date?: string;
    maxMarks?: string;
    sectionAMarks?: string;
    sectionBMarks?: string;
    sectionCMarks?: string;
    type?: string;
    subject?: { name: string };
    class?: { name: string };
}

const ExamPreview = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState<Exam | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchExam();
    }, [examId]);

    const fetchExam = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/exams/${examId}`);
            setExam(res.data);
        } catch (error) {
            console.error("Failed to fetch exam", error);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: exam?.title || 'Exam Paper',
    });

    if (!exam) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    const sections = {
        MCQ: exam.questions?.filter(q => q.type === 'MCQ') || [],
        SHORT: exam.questions?.filter(q => q.type === 'SHORT') || [],
        LONG: exam.questions?.filter(q => q.type === 'LONG') || [],
    };

    const isModuleOrPrelimExam = ['module', 'prelim'].includes(exam.type?.toLowerCase() || '');

    // Helper function to get paper format based on class
    const getPaperFormat = (className: string | undefined) => {
        if (!className) return 'PAPER II';

        const classUpper = className.toUpperCase();

        if (classUpper.includes('IX') || classUpper.includes('9')) {
            return 'PART I';
        } else if (classUpper.includes('X') && !classUpper.includes('XI') && !classUpper.includes('XII')) {
            return 'PAPER II';
        } else if (classUpper.includes('XI') && !classUpper.includes('XII')) {
            return 'PAPER I';
        } else if (classUpper.includes('XII') || classUpper.includes('12')) {
            return 'PAPER II';
        }

        return 'PAPER II';
    };

    const renderExamContent = () => (
        <div className="space-y-6 text-sm leading-relaxed">
            {sections.MCQ.length > 0 && (
                <div>
                    <div className="text-center font-bold underline mb-3">SECTION 'A'</div>
                    <div className="text-center font-bold underline mb-3">MCQ's (MULTIPLE CHOICE QUESTIONS)</div>
                    <div className="mb-2 flex justify-between items-start">
                        <div>
                            <strong>Q.</strong> Choose the correct option. Each question carries equal marks.
                        </div>
                        <span className="font-bold">
                            {exam.sectionAMarks ? (exam.sectionAMarks.includes('Marks') ? exam.sectionAMarks : `(${exam.sectionAMarks} Marks)`) : '(2 Marks)'}
                        </span>
                    </div>
                    <div className="space-y-4 ml-6">
                        {sections.MCQ.map((q, i) => (
                            <div key={q.id} className="break-inside-avoid">
                                <div className="flex">
                                    <span className="font-bold mr-2">{String.fromCharCode(105 + i)}.</span>
                                    <div className="flex-1">{q.text}</div>
                                </div>
                                {(() => {
                                    try {
                                        const opts = q.options ? JSON.parse(q.options) : [];
                                        if (opts.length > 0) {
                                            return (
                                                <div className="ml-6 mt-1 grid grid-cols-2 gap-x-8 gap-y-1">
                                                    {opts.map((opt: string, idx: number) => (
                                                        <div key={idx}>• {opt}</div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                    } catch (e) {
                                        // Fallback
                                    }
                                    return (
                                        <div className="ml-6 mt-1 grid grid-cols-2 gap-x-8 gap-y-1">
                                            <div>• Option A</div>
                                            <div>• Option B</div>
                                            <div>• Option C</div>
                                            <div>• Option D</div>
                                        </div>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {sections.SHORT.length > 0 && (
                <div className="mt-6">
                    <div className="text-center font-bold underline mb-3">SECTION 'B'</div>
                    <div className="mb-2 flex justify-between items-start">
                        <div>
                            <strong>NOTE:</strong> Attempt any 3 questions given below. Each question carries equal marks.
                        </div>
                        <span className="font-bold">
                            {exam.sectionBMarks ? (exam.sectionBMarks.includes('Marks') ? exam.sectionBMarks : `(${exam.sectionBMarks} Marks)`) : '(12 Marks)'}
                        </span>
                    </div>
                    <div className="space-y-3 ml-6">
                        {sections.SHORT.map((q, i) => (
                            <div key={q.id} className="flex break-inside-avoid">
                                <span className="font-bold mr-2">Q{i + 1}</span>
                                <div className="flex-1">{q.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {sections.LONG.length > 0 && (
                <div className="mt-6">
                    <div className="text-center font-bold underline mb-3">SECTION 'C'</div>
                    <div className="mb-2 flex justify-between items-start">
                        <div>
                            <strong>NOTE:</strong> Attempt any 1 questions given below.
                        </div>
                        <span className="font-bold">
                            {exam.sectionCMarks ? (exam.sectionCMarks.includes('Marks') ? exam.sectionCMarks : `(${exam.sectionCMarks} Marks)`) : '(10 Marks)'}
                        </span>
                    </div>
                    <div className="space-y-3 ml-6">
                        {sections.LONG.map((q, i) => (
                            <div key={q.id} className="break-inside-avoid">
                                <div className="flex">
                                    <span className="font-bold mr-2">Q{i + 1}</span>
                                    <div className="flex-1">{q.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex justify-between items-center mb-8 no-print">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <button onClick={() => navigate(-1)} className="hover:text-indigo-600 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium">Back to Exam</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Exam Preview</h1>
                        <p className="text-gray-500 mt-1">Review and export your exam paper.</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <Printer className="h-5 w-5 mr-2" />
                        Export to PDF
                    </button>
                </div>

                <div className="flex justify-center overflow-auto pb-20">
                    <div className="bg-white shadow-2xl p-12 min-h-[29.7cm] w-[21cm] mx-auto" ref={componentRef}>
                        {isModuleOrPrelimExam ? (
                            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <td>
                                            <div className="text-center mb-6">
                                                <div className="text-xs font-bold mb-1">Important Note: This paper is a property of private coaching center</div>
                                                <div className="text-xl font-bold underline mb-1">BOARD OF SECONDARY EDUCATION KARACHI</div>
                                                {exam.type?.toLowerCase() === 'prelim' && (
                                                    <div className="text-lg font-bold underline mb-1">PRELIMS</div>
                                                )}
                                                <div className="text-lg font-bold underline mb-1">{exam.title.toUpperCase()}</div>
                                                <div className="text-md font-bold underline mb-1">({getPaperFormat(exam.class?.name)} Class-{exam.class?.name?.toUpperCase()})</div>
                                                <div className="text-md font-bold underline mb-4">(SCIENCE & GENERAL GROUP)</div>

                                                <div className="flex justify-between text-sm font-bold px-4">
                                                    <span>Total time: {exam.time ? (exam.time.includes('Minutes') || exam.time.includes('Hour') ? exam.time : `${exam.time} Minutes`) : '2 Hours'}</span>
                                                    <span>Max. Marks: {exam.maxMarks || '40'}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {renderExamContent()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <>
                                <table className="w-full border-2 border-black mb-6" style={{ borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td className="border-2 border-black p-2 w-32 align-middle text-center">
                                                <img src="/ai-logo.png" alt="Logo" className="h-24 w-24 object-contain mx-auto" />
                                            </td>
                                            <td className="border-2 border-black p-3 text-center align-middle">
                                                <div className="font-bold text-base underline">Monthly Assessment</div>
                                                <div className="font-bold text-base underline">{exam.title}</div>
                                            </td>
                                            <td className="border-2 border-black p-2 w-40 align-middle text-center">
                                                <div className="inline-block text-left">
                                                    <div className="text-xs">
                                                        <strong className="mr-1">Time:</strong> {exam.time ? (exam.time.includes('Minutes') ? exam.time : `${exam.time} Minutes`) : '60 Minutes'}
                                                    </div>
                                                    <div className="text-xs my-1">
                                                        <strong className="mr-1">Max Marks:</strong> {exam.maxMarks || '30'}
                                                    </div>
                                                    <div className="text-xs">
                                                        <strong className="mr-1">Date:</strong> {exam.date || new Date().toLocaleDateString('en-GB')}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {renderExamContent()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    thead {
                        display: table-header-group;
                    }
                }
            `}</style>
        </div>
    );
};

export default ExamPreview;
