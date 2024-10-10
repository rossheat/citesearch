import React from 'react';
import { Link } from 'react-router-dom';

const FooterButtons: React.FC = () => (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
    <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</Link>
    <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</Link>
    <a href="https://github.com/rossheat/citesearch" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700">Open Source</a>
  </div>
);

export default FooterButtons;