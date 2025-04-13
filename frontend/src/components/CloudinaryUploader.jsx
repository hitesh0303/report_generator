import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaImage, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

const CloudinaryUploader = ({ 
    onUploadSuccess, 
    onUploadError,
    folder = 'report_images',
    uploadPreset = 'report_generator',
    className = '',
    maxFiles = 5,
    allowedFormats = ['jpg', 'jpeg', 'png', 'gif'],
    buttonText = 'Upload Images',
    showPreview = false,
    category = ''
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    
    const cloudName = 'darnokazg'; // Your Cloudinary cloud name
    
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        
        console.log(`[CloudinaryUploader] Selected ${files.length} files for upload${category ? ` in category: ${category}` : ''}`);
        
        if (files.length === 0) return;
        
        if (files.length > maxFiles) {
            setUploadStatus(`You can only upload up to ${maxFiles} files at once.`);
            console.log(`[CloudinaryUploader] Too many files selected: ${files.length}/${maxFiles}`);
            return;
        }
        
        // Check file types
        const invalidFiles = files.filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return !allowedFormats.includes(extension);
        });
        
        if (invalidFiles.length > 0) {
            setUploadStatus(`Invalid file type(s). Allowed: ${allowedFormats.join(', ')}`);
            console.log(`[CloudinaryUploader] Invalid file types detected: ${invalidFiles.map(f => f.name).join(', ')}`);
            return;
        }
        
        setIsUploading(true);
        setUploadStatus(`Uploading ${files.length} file(s)...`);
        setUploadProgress(0);
        
        console.log(`[CloudinaryUploader] Starting upload of ${files.length} files to Cloudinary`);
        console.log(`[CloudinaryUploader] Upload configuration:`, {
            cloudName,
            uploadPreset,
            folder,
            allowedFormats,
            category
        });
        
        try {
            const uploadedImages = [];
            let completed = 0;
            
            for (const file of files) {
                console.log(`[CloudinaryUploader] Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', uploadPreset);
                formData.append('folder', folder);
                
                // Add category to context if provided
                if (category) {
                    formData.append('context', `category=${category}`);
                    // Also add a tag for easier filtering
                    formData.append('tags', category);
                }
                
                try {
                    console.log(`[CloudinaryUploader] Sending request to Cloudinary API for ${file.name}`);
                    
                    const response = await axios.post(
                        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                        formData
                    );
                    
                    console.log(`[CloudinaryUploader] Upload success for ${file.name}:`, response.data);
                    
                    uploadedImages.push({
                        original: response.data.secure_url,
                        thumbnail: response.data.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/'),
                        publicId: response.data.public_id,
                        width: response.data.width,
                        height: response.data.height,
                        format: response.data.format,
                        originalFilename: file.name,
                        category: category
                    });
                    
                    completed++;
                    setUploadProgress(Math.round((completed / files.length) * 100));
                    setUploadStatus(`Uploaded ${completed} of ${files.length} images...`);
                } catch (error) {
                    console.error(`[CloudinaryUploader] Error uploading ${file.name}:`, error);
                    console.error(`[CloudinaryUploader] Error details:`, error.response?.data || error.message);
                }
            }
            
            console.log(`[CloudinaryUploader] Upload completed. ${uploadedImages.length}/${files.length} files uploaded successfully`);
            console.log(`[CloudinaryUploader] Uploaded images:`, uploadedImages);
            
            // Temporarily save for the status display
            setUploadedFiles(uploadedImages);
            setUploadStatus(`Successfully uploaded ${uploadedImages.length} images!`);
            
            if (typeof onUploadSuccess === 'function') {
                console.log(`[CloudinaryUploader] Calling onUploadSuccess callback with ${uploadedImages.length} images`);
                onUploadSuccess(uploadedImages, category);
                
                // Clear the uploadedFiles state after a delay to prevent duplicated UI
                setTimeout(() => {
                    setUploadedFiles([]);
                }, 2000);
            }
        } catch (error) {
            console.error('[CloudinaryUploader] Upload error:', error);
            console.error('[CloudinaryUploader] Error details:', error.response?.data || error.message);
            setUploadStatus(`Upload failed: ${error.message}`);
            
            if (typeof onUploadError === 'function') {
                onUploadError(error);
            }
        } finally {
            setIsUploading(false);
        }
    };
    
    // Update the button text to include category if provided
    const displayButtonText = category ? `${buttonText} - ${category.charAt(0).toUpperCase() + category.slice(1)}` : buttonText;
    
    return (
        <div className={`cloudinary-uploader ${className}`}>
            <div className="mb-4">
                <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer 
                    ${isUploading ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}
                >
                    <div className="flex flex-col items-center justify-center">
                        {isUploading ? (
                            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        ) : (
                            <FaCloudUploadAlt className="w-8 h-8 text-blue-500 mb-2" />
                        )}
                        <p className="text-sm text-gray-700 font-medium">
                            {isUploading ? uploadStatus : displayButtonText}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {!isUploading && `Allowed formats: ${allowedFormats.join(', ')}`}
                        </p>
                        {isUploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}
                    </div>
                    <input 
                        type="file" 
                        className="hidden"
                        onChange={handleFileChange}
                        accept={allowedFormats.map(format => `.${format}`).join(',')}
                        multiple={maxFiles > 1}
                        disabled={isUploading}
                    />
                </label>
            </div>
            
            {uploadStatus && !isUploading && (
                <div className={`text-sm p-2 mb-3 rounded ${
                    uploadStatus.includes('Successfully') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    <p className="flex items-center">
                        {uploadStatus.includes('Successfully') 
                            ? <FaCheck className="mr-1" /> 
                            : <FaTimes className="mr-1" />
                        }
                        {uploadStatus}
                    </p>
                </div>
            )}
            
            {showPreview && uploadedFiles.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Images{category ? ` (${category})` : ''}:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {uploadedFiles
                            .filter(file => !category || file.category === category)
                            .map((file, index) => (
                                <div key={index} className="relative group">
                                    <img 
                                        src={file.thumbnail} 
                                        alt={file.originalFilename}
                                        className="w-full h-24 object-cover rounded border border-gray-200"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <a 
                                            href={file.original} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="p-1 bg-white rounded-full"
                                        >
                                            <FaImage className="text-blue-500" />
                                        </a>
                                    </div>
                                </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CloudinaryUploader; 