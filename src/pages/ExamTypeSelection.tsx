import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import { Skeleton } from '../components/Skeleton';
import { Calendar, BookOpen, GraduationCap } from 'lucide-react';

const ExamTypeSelection = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassName = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/classes/${classId}`);
                const data = await res.json();
                setClassName(data.name);
            } catch (error) {
                console.error("Failed to fetch class name", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClassName();
    }, [classId]);

    const examTypes = [
        {
            id: 'Monthly',
            name: 'Monthly Exam',
            description: 'Regular monthly assessment exams',
            icon: Calendar,
            color: 'indigo'
        },
        {
            id: 'Module',
            name: 'Module Exam',
            description: 'Module-based assessment exams',
            icon: BookOpen,
            color: 'purple'
        },
        {
            id: 'Prelim',
            name: 'Prelim Exam',
            description: 'Preliminary examination papers',
            icon: GraduationCap,
            color: 'blue'
        }
    ];

    const handleSelectType = (type: string) => {
        navigate(`/class/${classId}/${type}`);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                <Breadcrumb items={[
                    { label: className || 'Class' }
                ]} />
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Exam Type</h1>
                    <p className="text-gray-500">Choose the type of exam you want to manage</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                                <Skeleton className="w-16 h-16 rounded-xl mb-4" />
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-48 mb-4" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {examTypes.map((type, index) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleSelectType(type.id)}
                                    className={`group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-8 transition-all duration-300 transform hover:-translate-y-1 text-left opacity-0 animate-fadeInUp stagger-${index + 1}`}
                                >
                                    <div className={`bg-${type.color}-50 p-4 rounded-xl group-hover:bg-${type.color}-100 transition-colors inline-block mb-4`}>
                                        <Icon className={`h-8 w-8 text-${type.color}-600`} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h2>
                                    <p className="text-gray-500 text-sm">{type.description}</p>
                                    <div className="mt-4 text-indigo-600 font-medium flex items-center gap-2">
                                        View Exams
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamTypeSelection;
