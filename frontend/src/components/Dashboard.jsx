// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaHistory, FaChartBar, FaUserTie,FaChalkboardTeacher } from 'react-icons/fa';

const Dashboard = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reports</h1>
      
      <div className="flex flex-col space-y-4 mb-8">
        <Link 
          to="/create-report" 
          className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 w-fit"
        >
          <FaChalkboardTeacher className="mr-2" /> Teaching Activity Report
        </Link>
        <Link 
          to="/create-pda-report" 
          className="flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 w-fit"
        >
          <FaChartBar className="mr-2" /> Create PDA Report
        </Link>
        <Link 
          to="/create-expert-report" 
          className="flex items-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-300 ease-in-out transform hover:scale-105 w-fit"
        >
          <FaUserTie className="mr-2" /> Create Expert Session Report
        </Link>
        <Link 
          to="/previous-reports" 
          className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 w-fit"
        >
          <FaHistory className="mr-2" /> View Previous Reports
        </Link>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-600">No reports found. Create your first report!</p>
        ) : (
          <ul className="space-y-3">
            {reports.slice(0, 4).map(report => (
              <li key={report._id} className="bg-white border p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/view-report/${report._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {report.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {report.subjectName ? `${report.subjectName} • ` : ''}{report.date || report.eventDate}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    report.reportType === 'teaching' ? 'bg-blue-100 text-blue-800' : 
                    report.reportType === 'pda' ? 'bg-purple-100 text-purple-800' : 
                    report.reportType === 'expert' ? 'bg-orange-100 text-orange-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.reportType === 'teaching' ? 'Teaching' : 
                     report.reportType === 'pda' ? 'PDA' : 
                     report.reportType === 'expert' ? 'Expert' : 
                     'Report'}
                  </span>
                </div>
              </li>
            ))}
            {reports.length > 5 && (
              <li className="text-center mt-4">
                <Link to="/previous-reports" className="text-blue-600 hover:underline">
                  View all reports
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
