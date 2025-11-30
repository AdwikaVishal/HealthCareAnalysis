import { useState } from 'react';
import { User, X, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function UserDropdown() {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    setShowUserInfo(false);
  };

  const dropdown = showUserInfo ? createPortal(
    <>
      <div className="fixed inset-0 z-[99999] bg-black/20" onClick={() => setShowUserInfo(false)}></div>
      <div className="fixed top-16 right-6 z-[99999] w-80 dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-200 rounded-lg shadow-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white text-slate-900">User Information</h3>
          <button 
            onClick={() => setShowUserInfo(false)}
            className="dark:text-gray-400 text-slate-600 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold dark:text-white text-slate-900">{user?.name}</p>
              <p className="text-sm dark:text-gray-400 text-slate-600">Health User</p>
            </div>
          </div>
          
          <div className="text-sm">
            <p className="dark:text-gray-400 text-slate-600">Member Since</p>
            <p className="dark:text-white text-slate-900 font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="text-sm">
            <p className="dark:text-gray-400 text-slate-600">Email</p>
            <p className="dark:text-white text-slate-900 font-medium">{user?.email}</p>
          </div>
          
          <div className="text-sm">
            <p className="dark:text-gray-400 text-slate-600">Uploads</p>
            <p className="dark:text-white text-slate-900 font-medium">{user?.uploads?.length || 0} files</p>
          </div>
          
          <div className="pt-3 border-t dark:border-slate-700 border-slate-200">
            <button 
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <button 
        onClick={() => setShowUserInfo(!showUserInfo)}
        className="flex items-center space-x-2 dark:bg-blue-900/50 bg-slate-200/70 rounded-lg px-3 py-2 dark:hover:bg-blue-800/50 hover:bg-slate-300/70 transition-colors"
      >
        <User className="w-4 h-4 dark:text-gray-400 text-slate-900" />
        <span className="text-sm dark:text-gray-300 text-slate-900">{user?.name?.split(' ')[0] || 'User'}</span>
      </button>
      {dropdown}
    </>
  );
}