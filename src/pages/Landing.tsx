import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import { Check, Clock, Calendar, FileText, Printer, Download, Users2, Sparkles } from 'lucide-react';

const Landing = () => {
    const [stats, setStats] = useState({ totalExams: 0, activeTeachers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/stats`);
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-gray-50/50 relative overflow-hidden font-sans scroll-smooth">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">

                {/* Hero Content */}
                <div className="text-center max-w-2xl mx-auto mt-0">
                    <div className="flex justify-center mb-8">
                        <img
                            src="/poetry.png"
                            alt="Urdu Poetry"
                            className="max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg w-full object-contain filter drop-shadow-lg transform hover:scale-105 transition-transform duration-500 rounded-3xl"
                        />
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6 px-2">
                        Generate Exams with <br />
                        <span className="text-indigo-600">AI Precision</span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-lg mx-auto px-4">
                        Create, customize, and export professional question papers for any class in minutes.
                    </p>

                    <div className="flex justify-center">
                        <Link to="/login" className="bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium text-base sm:text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Start Generating
                        </Link>
                    </div>

                </div>
                {/* Checkmark Box - Hidden on mobile */}
                <div className="hidden md:block absolute -bottom-10 -right-10 bg-white p-4 rounded-2xl shadow-lg transform rotate-12">
                    <div className="bg-green-500 rounded-lg p-2">
                        <Check className="text-white w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Features Section - Moved Up */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-20">
                <div className="grid grid-cols-1 gap-8">
                    {/* How It Works */}
                    <div id="how-it-works" className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow scroll-mt-24">
                        <div className="flex items-start gap-4">
                            <div className="bg-indigo-100 p-4 rounded-2xl flex-shrink-0">
                                <FileText className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">How It Works</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Create professional exam papers in three simple steps: Select your class and subject, customize exam details like time and marks, then generate and export your question paper instantly.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Templates */}
                    <div id="templates" className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow scroll-mt-24">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-100 p-4 rounded-2xl flex-shrink-0">
                                <Calendar className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Templates</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Choose from pre-designed exam templates for Mid-Term, Final-Term, and Monthly tests. Each template is professionally formatted and ready to customize with your questions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Question Bank */}
                    <div id="question-bank" className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow scroll-mt-24">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-4 rounded-2xl flex-shrink-0">
                                <Download className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Question Bank</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Build and manage your own question repository. Organize questions by subject, session, and difficulty level for quick access when creating new exams.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements - Hidden on smaller screens to prevent overlap */}
            <div className="hidden xl:block">
                {/* Left Side - Quick Stats & Recent Activity */}
                <div className="absolute top-40 left-10 flex flex-col gap-8 z-0 pointer-events-none">
                    {/* Quick Stats */}
                    <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-500 pointer-events-auto">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-72 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Quick Stats</h3>
                                <div className="bg-indigo-100 p-2 rounded-full">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-indigo-600">
                                                {loading ? '...' : formatNumber(stats.totalExams) + '+'}
                                            </div>
                                            <div className="text-xs text-gray-600">Exams Generated</div>
                                        </div>
                                        <FileText className="w-8 h-8 text-indigo-400" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {loading ? '...' : stats.activeTeachers + '+'}
                                            </div>
                                            <div className="text-xs text-gray-600">Active Teachers</div>
                                        </div>
                                        <Users2 className="w-8 h-8 text-green-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="transform rotate-2 hover:rotate-0 transition-transform duration-500 pointer-events-auto pl-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-80 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Generated Physics Paper</span>
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white"></div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Just now</div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Edited History Quiz</span>
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white"></div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '80%' }}></div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Upcoming Exams & Export Options */}
                <div className="absolute top-40 right-10 flex flex-col gap-8 z-0 pointer-events-none">
                    {/* Upcoming Exams */}
                    <div className="transform rotate-3 hover:rotate-0 transition-transform duration-500 pointer-events-auto">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-72 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Upcoming Exams</h3>
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">Class 10 - Science</div>
                                    <div className="text-sm font-medium text-gray-800">Final Term Examination</div>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    <div className="text-sm font-medium text-indigo-700">Tomorrow, 09:00 AM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Options */}
                    <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-500 pointer-events-auto pr-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-72 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Export Options</h3>
                            <div className="flex justify-center gap-4">
                                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 hover:bg-red-50 transition-colors">
                                    <FileText className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 hover:bg-blue-50 transition-colors">
                                    <Printer className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 hover:bg-green-50 transition-colors">
                                    <Download className="w-8 h-8 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Landing;
