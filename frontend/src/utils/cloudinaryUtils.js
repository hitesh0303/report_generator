import axios from 'axios';

// Constants for Cloudinary configuration
const CLOUDINARY_API_URL = import.meta.env.VITE_CLOUDINARY_API_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Convert base64 string to a Blob
const base64ToBlob = (base64Data, contentType = '') => {
  const sliceSize = 512;
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

// Upload base64 image to Cloudinary
export const uploadBase64ToCloudinary = async (base64Image, title = '', setStatusCallback = null) => {
  console.log(`[cloudinaryUtils] Starting upload for image: ${title}`);
  
  try {
    if (!base64Image || !base64Image.startsWith('data:image')) {
      console.error('[cloudinaryUtils] Invalid base64 image provided');
      return null;
    }

    if (setStatusCallback) setStatusCallback(`Uploading chart: ${title}...`);
    
    // Convert base64 to Blob
    const imageBlob = base64ToBlob(base64Image, 'image/png');
    console.log(`[cloudinaryUtils] Converted base64 to Blob: size=${imageBlob.size} bytes, type=${imageBlob.type}`);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', imageBlob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'report_charts');
    
    const publicId = `chart_${title.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    formData.append('public_id', publicId);
    console.log(`[cloudinaryUtils] Uploading to Cloudinary with public_id: ${publicId}`);
    
    // Upload to Cloudinary
    console.log('[cloudinaryUtils] Sending request to Cloudinary API...');
    const response = await axios.post(CLOUDINARY_API_URL, formData);
    
    console.log('[cloudinaryUtils] Upload successful:', response.data);
    
    if (setStatusCallback) setStatusCallback(`Successfully uploaded chart: ${title}`);
    
    // Return the secure URL and other data
    return {
      src: response.data.secure_url,
      publicId: response.data.public_id,
      title: title
    };
  } catch (error) {
    console.error('[cloudinaryUtils] Error uploading to Cloudinary:', error);
    console.error('[cloudinaryUtils] Error details:', error.response?.data || error.message);
    if (setStatusCallback) setStatusCallback(`Error uploading chart: ${error.message}`);
    return null;
  }
};

// Upload multiple base64 images to Cloudinary
export const uploadMultipleBase64ToCloudinary = async (images = [], setStatusCallback = null) => {
  console.log(`[cloudinaryUtils] Starting batch upload of ${images.length} images`);
  
  if (!images || images.length === 0) {
    console.log('[cloudinaryUtils] No images to upload');
    return [];
  }
  
  if (setStatusCallback) setStatusCallback(`Preparing to upload ${images.length} charts to Cloudinary...`);
  
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`[cloudinaryUtils] Processing image ${i+1}/${images.length}: ${image.title || 'Untitled'}`);
    
    if (setStatusCallback) setStatusCallback(`Uploading chart ${i+1}/${images.length}: ${image.title}...`);
    
    const uploadResult = await uploadBase64ToCloudinary(
      image.src,
      image.title || `Chart_${i+1}`,
      null // Don't use callback for individual uploads to avoid too many status updates
    );
    
    if (uploadResult) {
      console.log(`[cloudinaryUtils] Successfully uploaded image ${i+1}:`, uploadResult);
      results.push(uploadResult);
    } else {
      console.error(`[cloudinaryUtils] Failed to upload image ${i+1}`);
    }
  }
  
  console.log(`[cloudinaryUtils] Batch upload complete. ${results.length}/${images.length} images uploaded successfully.`);
  console.log('[cloudinaryUtils] Uploaded image results:', results);
  
  if (setStatusCallback) {
    setStatusCallback(results.length > 0 
      ? `Successfully uploaded ${results.length} charts to Cloudinary.` 
      : 'No charts were uploaded to Cloudinary.');
  }
  
  return results;
};

export default {
  uploadBase64ToCloudinary,
  uploadMultipleBase64ToCloudinary
}; 