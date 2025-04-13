import React, { useState } from 'react';
import axios from 'axios';

const CloudinaryTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  
  const cloudName = 'darnokazg'; // Your Cloudinary cloud name
  const uploadPreset = 'report_generator'; // Your upload preset
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setErrorDetails(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setUploading(true);
    setError(null);
    setErrorDetails(null);
    setResult(null);
    
    try {
      console.log('Starting test upload to Cloudinary');
      console.log('File details:', { name: file.name, type: file.type, size: file.size });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'cloudinary_test');
      
      console.log('Uploading to Cloudinary with cloud name:', cloudName);
      console.log('Using upload preset:', uploadPreset);
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      
      console.log('Upload successful:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed');
      
      // Provide detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data);
        setErrorDetails({
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        setErrorDetails({
          message: 'No response received from server',
          request: 'Request was sent but no response was received'
        });
      } else {
        setErrorDetails({
          message: 'Error in request setup',
          details: error.toString()
        });
      }
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6 mt-10">
      <h2 className="text-xl font-bold text-center">Cloudinary Upload Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select an image to upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {file && (
          <div className="text-sm text-gray-500">
            Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
        </button>
        
        {errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
            <h3 className="text-red-700 font-medium mb-2">Detailed Error Information:</h3>
            <pre className="text-xs overflow-auto max-h-48 p-2 bg-red-100 rounded">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-700 font-medium mb-2">Upload Successful!</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Public ID:</span> {result.public_id}
              </div>
              <div>
                <span className="font-medium">URL:</span>{' '}
                <a
                  href={result.secure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {result.secure_url}
                </a>
              </div>
              <div className="mt-4">
                <img
                  src={result.secure_url}
                  alt="Uploaded"
                  className="w-full h-auto border border-gray-200 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-6">
        <div>Cloud Name: {cloudName}</div>
        <div>Upload Preset: {uploadPreset}</div>
        <div>Folder: cloudinary_test</div>
      </div>
    </div>
  );
};

export default CloudinaryTest; 