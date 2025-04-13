import React from 'react';
import { Link } from 'react-router-dom';

const PublicNavbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          PICT Report Generator
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar; 