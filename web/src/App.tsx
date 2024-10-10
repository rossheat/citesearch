import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-custom">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;