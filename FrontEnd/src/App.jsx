import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Insights from './pages/Insights';
import Forecast from './pages/Forecast';
import HealthAssistant from './pages/HealthAssistant';
import WellnessCenter from './pages/WellnessCenter';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Loader from './components/Loader';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="trends" element={<Trends />} />
        <Route path="insights" element={<Insights />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="health-assistant" element={<HealthAssistant />} />
        <Route path="wellness-center" element={<WellnessCenter />} />
        <Route path="upload" element={<Upload />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;