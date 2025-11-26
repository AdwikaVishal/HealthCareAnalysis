import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

export default function MainLayout() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await api.searchData(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen">
      <Navbar onSearch={handleSearch} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {searchResults.length > 0 && (
            <div className="mb-6 card-gradient rounded-xl p-6">
              <h2 className="text-xl font-semibold dark:text-white text-slate-900 mb-4">Search Results</h2>
              <div className="space-y-3">
                {searchResults.map(result => (
                  <div key={result.id} className="p-3 dark:bg-blue-900/40 bg-slate-100/70 rounded-lg">
                    <h3 className="font-medium dark:text-white text-slate-900">{result.title}</h3>
                    <p className="text-sm dark:text-gray-300 text-slate-800">{result.description}</p>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}