import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('healthApp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('healthApp_users') || '[]');
    const existingUser = users.find(u => u.email === email && u.password === password);
    
    if (existingUser) {
      const userData = { ...existingUser };
      delete userData.password; // Don't store password in context
      setUser(userData);
      localStorage.setItem('healthApp_user', JSON.stringify(userData));
      return { success: true };
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (name, email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('healthApp_users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      uploads: []
    };
    
    users.push(newUser);
    localStorage.setItem('healthApp_users', JSON.stringify(users));
    
    // Log in the new user
    const userData = { ...newUser };
    delete userData.password;
    setUser(userData);
    localStorage.setItem('healthApp_user', JSON.stringify(userData));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthApp_user');
    // Clear current data when user logs out
    if (typeof window !== 'undefined') {
      import('../services/api').then(({ api }) => {
        api.clearCurrentData();
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: {} }));
      });
    }
  };

  const saveUserUpload = (uploadData) => {
    if (!user) return;
    
    // Update user's upload history
    const users = JSON.parse(localStorage.getItem('healthApp_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex].uploads = users[userIndex].uploads || [];
      users[userIndex].uploads.unshift({
        ...uploadData,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 10 uploads
      users[userIndex].uploads = users[userIndex].uploads.slice(0, 10);
      
      localStorage.setItem('healthApp_users', JSON.stringify(users));
      
      // Update current user context
      const updatedUser = { ...users[userIndex] };
      delete updatedUser.password;
      setUser(updatedUser);
      localStorage.setItem('healthApp_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    saveUserUpload,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};