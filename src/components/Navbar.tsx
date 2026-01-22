import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Grid } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth() as any;
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm pt-4 px-6">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-white/20 px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <Grid className="h-6 w-6 text-gray-900" />
              <span className="text-lg font-bold text-gray-900">AI Exam Gen</span>
            </Link>
          </div>

          {/* Center Links (Hidden on mobile for simplicity, or stackable) */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900">How It Works</Link>
            <Link to="#templates" className="text-sm font-medium text-gray-600 hover:text-gray-900">Templates</Link>
            <Link to="#question-bank" className="text-sm font-medium text-gray-600 hover:text-gray-900">Question Bank</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.username}</span>
                <button onClick={handleLogoutClick} className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium bg-gray-900 text-white shadow-sm rounded-full px-6 py-2.5 hover:bg-gray-800 transition-all hover:shadow-md">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Sign Out?</h2>
            <p className="text-gray-500 mb-8 text-center">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
