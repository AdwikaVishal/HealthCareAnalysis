import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Insights from './pages/Insights';
import Forecast from './pages/Forecast';
import HealthAssistant from './pages/HealthAssistant';
import WellnessCenter from './pages/WellnessCenter';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;