import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ExamTypeSelection from './pages/ExamTypeSelection';
import SessionSelection from './pages/SessionSelection';
import SubjectSelection from './pages/SubjectSelection';
import ClassView from './pages/ClassView';
import CreateExam from './pages/CreateExam';
import ExamPreview from './pages/ExamPreview';
import Landing from './pages/Landing';
import AdminUpload from './pages/AdminUpload';
import QuestionBankManagement from './pages/QuestionBankManagement';
import { Particles } from '@/components/ui/particles';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth() as any;
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <Particles
                className="absolute inset-0 -z-10"
                quantity={100}
                ease={80}
                color="#000000"
                refresh
            />
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/manage-users" element={
                        <ProtectedRoute>
                            <UserManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/upload" element={
                        <ProtectedRoute>
                            <AdminUpload />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/question-bank" element={
                        <ProtectedRoute>
                            <QuestionBankManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/class/:classId" element={
                        <ProtectedRoute>
                            <ExamTypeSelection />
                        </ProtectedRoute>
                    } />
                    <Route path="/class/:classId/:examType" element={
                        <ProtectedRoute>
                            <SessionSelection />
                        </ProtectedRoute>
                    } />
                    <Route path="/class/:classId/:examType/:sessionId" element={
                        <ProtectedRoute>
                            <SubjectSelection />
                        </ProtectedRoute>
                    } />
                    <Route path="/class/:classId/:examType/:sessionId/:subjectId" element={
                        <ProtectedRoute>
                            <ClassView />
                        </ProtectedRoute>
                    } />
                    <Route path="/class/:classId/:examType/:sessionId/:subjectId/create-exam" element={
                        <ProtectedRoute>
                            <CreateExam />
                        </ProtectedRoute>
                    } />
                    <Route path="/exam/:examId/preview" element={
                        <ProtectedRoute>
                            <ExamPreview />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
