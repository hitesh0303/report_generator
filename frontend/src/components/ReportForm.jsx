// src/components/ReportForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FaArrowLeft, FaFilePdf, FaFileWord, FaUpload, FaTrash, FaFileExcel } from "react-icons/fa";
import ReportPDF from "./ReportPDF";
import FeedbackCharts from "./FeedbackCharts";
import { processExcelData, prepareChartData } from "../utils/feedbackAnalysis";
import * as XLSX from 'xlsx';
import { Chart as ChartJS } from 'chart.js';
import html2canvas from 'html2canvas';
import { pdf } from '@react-pdf/renderer';

const ReportForm = () => {
  const initialFormState = {
    title: "",
    subjectName: "",
    facultyName: "",
    date: "",
    academicYear: "",
    semester: "",
    objectives: [""],
    description: "",
    learningOutcomes: [""],
    targetYear: "",
    images: [],
    feedback: [],
    participationData: { 
      totalStudents: 0, 
      materialProvidedTo: 0, 
      studentsParticipated: 0,
      participationPercentage: 0
    },
    feedbackData: [], // Store processed feedback data
    chartImages: [], // Store base64 images of charts
    excelData: [], // Store student performance data
    extraSections: [] // Initialize extraSections as an empty array
  };

  const [formData, setFormData] = useState(initialFormState);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [feedbackFile, setFeedbackFile] = useState(null);
  const [studentDataFile, setStudentDataFile] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const [isProcessingStudentData, setIsProcessingStudentData] = useState(false);
  const fileInputRef = useRef(null);
  const feedbackInputRef = useRef(null);
  const studentDataInputRef = useRef(null);
  const chartsContainerRef = useRef(null);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [chartImages, setChartImages] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Calculate participation percentage whenever the values change
  useEffect(() => {
    const totalStudents = parseInt(formData.participationData.totalStudents) || 0;
    const studentsParticipated = parseInt(formData.participationData.studentsParticipated) || 0;
    
    if (totalStudents > 0) {
      const percentage = (studentsParticipated / totalStudents * 100).toFixed(2);
      setFormData(prevData => ({
        ...prevData,
        participationData: {
          ...prevData.participationData,
          participationPercentage: percentage
        }
      }));
    }
  }, [formData.participationData.totalStudents, formData.participationData.studentsParticipated]);

  // ✅ Generate and Download Word Report with loading state
  const generateWordReport = async (formData) => {
    setIsGeneratingWord(true);
    try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: "PUNE INSTITUTE OF COMPUTER TECHNOLOGY", heading: "Title" }),
            new Paragraph( {text: "Department: Information Technology", bold: true} ),
              new Paragraph(new TextRun({ text: `Academic Year: ${formData.academicYear}`, bold: true })),
            new Paragraph(`Subject: ${formData.subjectName}`),
            new Paragraph(`Faculty: ${formData.facultyName}`),
            new Paragraph(`Date: ${formData.date}`),
            new Paragraph(`No. of Students Attended: ${formData.participationData.totalStudents}`),
              new Paragraph(`Learning Material Provided To: ${formData.participationData.materialProvidedTo}`),
              new Paragraph(`No. of Students Participated: ${formData.participationData.studentsParticipated}`),
              new Paragraph(`Participation Percentage: ${formData.participationData.participationPercentage}%`),
            new Paragraph(""),
            new Paragraph({ text: "Objectives:", heading: "Heading1" }),
            ...formData.objectives.map((obj) => new Paragraph(obj)),
            new Paragraph(""),
            new Paragraph({ text: "Learning Outcomes:", heading: "Heading1" }),
            ...formData.learningOutcomes.map((outcome) => new Paragraph(outcome)),
            new Paragraph(""),
            new Paragraph({ text: "Student Performance Data:", heading: "Heading1" }),
            ...(formData.excelData.length > 0 ? 
              [new Paragraph(`Student performance data for ${formData.excelData.length} students included in the report.`)] : 
              [new Paragraph("No student performance data available.")]),
            new Paragraph(""),
            new Paragraph({ text: "Student Feedback Analysis:", heading: "Heading1" }),
              ...(formData.chartImages.length > 0 ? 
                [new Paragraph("Feedback analysis charts included in the report.")] : 
                [new Paragraph("No feedback analysis available.")]),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${formData.title.replace(/\s+/g, "_")}.docx`);
    } catch (error) {
      console.error("Error generating Word document:", error);
      alert("Failed to generate Word document. Please try again.");
    } finally {
      setIsGeneratingWord(false);
    }
  };

  //image upload to cloudinary
  const uploadImagesToCloudinary = async (e) => {
    // Only process file selection events from file input
    if (e && e.target && e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      // Show uploading status
      setStatusMessage(`Uploading ${files.length} image(s) to Cloudinary...`);
      
      const newImageFiles = [];
      const uploadedCloudinaryUrls = [];
      const cloudinaryUploadUrl = "https://api.cloudinary.com/v1_1/darnokazg/image/upload";
      const cloudinaryUploadPreset = "report_generator";
      
      // Upload each file to Cloudinary immediately
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Create a preview URL for the local image display
          const imagePreview = URL.createObjectURL(file);
          
          // Create FormData for Cloudinary upload
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", cloudinaryUploadPreset);
          formData.append("folder", "report_images");
          
          // Upload to Cloudinary
          setStatusMessage(`Uploading image ${i + 1} of ${files.length}...`);
          const response = await axios.post(cloudinaryUploadUrl, formData);
          
          // Store both the preview and the Cloudinary URL
          const cloudinaryUrl = response.data.secure_url;
          uploadedCloudinaryUrls.push(cloudinaryUrl);
          
          newImageFiles.push({
            file,                 // Original file (for reference)
            preview: imagePreview, // Local preview URL
            cloudinaryUrl         // The Cloudinary URL for final PDF
          });
          
          setStatusMessage(`Uploaded ${i + 1} of ${files.length} images...`);
        } catch (error) {
          console.error("Error uploading image to Cloudinary:", error);
          setStatusMessage(`Error uploading image ${i + 1}: ${error.message}`);
          
          // Still add the file with local preview but mark as failed upload
          const imagePreview = URL.createObjectURL(file);
          newImageFiles.push({
            file,
            preview: imagePreview,
            uploadFailed: true
          });
        }
      }
      
      // Update state with new images that include both preview and Cloudinary URLs
      setImageFiles(prevImages => [...prevImages, ...newImageFiles]);
      
      // Update formData.images with the Cloudinary URLs
      setFormData(prevFormData => ({
        ...prevFormData,
        images: [...(prevFormData.images || []), ...uploadedCloudinaryUrls]
      }));
      
      // Clear the file input to allow selecting the same files again
      e.target.value = null;
      
      // Show success message
      setStatusMessage(uploadedCloudinaryUrls.length > 0 
        ? `Successfully uploaded ${uploadedCloudinaryUrls.length} image(s) to Cloudinary!` 
        : 'No images were uploaded successfully. You can try again.');
      
      // Clear the status message after 3 seconds
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Parse Student Excel Data
  const parseStudentExcelData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Validate the data has the required columns
          if (jsonData.length === 0) {
            reject(new Error("The Excel file is empty."));
            return;
          }
          
          // Check for required columns
          const firstRow = jsonData[0];
          const requiredColumns = ['Sr No', 'Roll Number', 'Name', 'Marks'];
          const missingColumns = requiredColumns.filter(col => !(col in firstRow));
          
          if (missingColumns.length > 0) {
            reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
            return;
          }
          
          // Process the data to normalize it
          const processedData = jsonData.map(row => {
            return {
              'Sr No': row['Sr No'] || '',
              'Roll Number': row['Roll Number'] || '',
              'Name': row['Name'] || '',
              'Marks': row['Marks'] || 0,
              'Performance': row['Performance'] || (
                row['Marks'] >= 80 ? 'Excellent' : 
                row['Marks'] >= 60 ? 'Good' : 
                row['Marks'] >= 40 ? 'Average' : 'Needs Improvement'
              )
            };
          });
          
          resolve(processedData);
        } catch (error) {
          console.error("Error processing Excel file:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  // Handle Student Data Excel upload
  const handleStudentDataUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStudentDataFile(file);
      setIsProcessingStudentData(true);
      setStatusMessage("Processing student performance data...");
      
      try {
        // Process the Excel file
        const performanceData = await parseStudentExcelData(file);
        
        // Update form data with student performance data
        setFormData({
          ...formData,
          excelData: performanceData
        });
        
        setStatusMessage(`Successfully loaded performance data for ${performanceData.length} students.`);
      } catch (error) {
        console.error("Error processing student data file:", error);
        setStatusMessage(`Error: ${error.message}`);
        alert("Failed to process student data file. Please check the format and try again.");
      } finally {
        setIsProcessingStudentData(false);
      }
    }
  };

  // Handle Feedback Excel upload
  const handleFeedbackUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFeedbackFile(file);
      setIsProcessingFeedback(true);
      
      try {
        // Process the Excel file
        const processedData = await processExcelData(file);
        
        // Prepare data for charts
        const preparedChartData = prepareChartData(processedData);
        setChartData(preparedChartData);
        
        // Update form data with feedback data
        setFormData({
          ...formData,
          feedbackData: processedData
        });
      } catch (error) {
        console.error("Error processing feedback file:", error);
        alert("Failed to process feedback file. Please check the format and try again.");
      } finally {
        setIsProcessingFeedback(false);
      }
    }
  };

  // Capture charts as images
  const captureCharts = async () => {
    setStatusMessage('Starting to capture charts...');
    if (!chartsContainerRef.current) {
      console.error('Chart container ref is not available');
      setStatusMessage('Error: Chart container not found');
      return;
    }

    try {
      // Clear any previous chart images
      setChartImages([]);
      const chartImagesArray = [];
      
      // Find all question containers
      const chartItemElements = document.querySelectorAll('[id^="chart-item-"]');
      setStatusMessage(`Found ${chartItemElements.length} chart items to capture`);
      
      if (chartItemElements.length === 0) {
        setStatusMessage('No chart items found to capture');
        return;
      }

      // Process each question container separately
      for (let i = 0; i < chartItemElements.length; i++) {
        const itemElement = chartItemElements[i];
        const questionHeader = itemElement.querySelector('h4').textContent;
        setStatusMessage(`Capturing charts for question: ${questionHeader}...`);
        
        // Capture the entire chart item (both bar and pie charts together)
        try {
          // Add temporary styling to make content more compact for capture
          const originalStyle = itemElement.getAttribute('style') || '';
          itemElement.style.backgroundColor = '#ffffff';
          itemElement.style.padding = '15px';
          itemElement.style.boxShadow = 'none';
          itemElement.style.border = 'none';
          itemElement.style.margin = '0';
          
          // Get content measurements to crop out whitespace
          const chartGrid = itemElement.querySelector('.grid');
          if (chartGrid) {
            chartGrid.style.gap = '10px'; // Reduce gap between charts
          }
          
          const canvas = await html2canvas(itemElement, {
            scale: 2.5, // Slightly reduced scale but still high quality
            logging: true,
            useCORS: true,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc, element) => {
              // Clean up the cloned element for better capture
              element.style.width = `${itemElement.offsetWidth}px`;

              // Remove any excessive padding/margins from child elements
              Array.from(element.querySelectorAll('*')).forEach(el => {
                if (el.style) {
                  el.style.margin = '0px';
                  el.style.marginTop = '5px';
                  el.style.marginBottom = '5px';
                }
              });
              
              // Make chart containers more compact
              const chartContainers = element.querySelectorAll('[id^="bar-chart-container-"], [id^="pie-chart-container-"]');
              chartContainers.forEach(container => {
                if (container.style) {
                  container.style.height = '250px';
                }
              });
            }
          });
          
          // Restore original styling
          itemElement.setAttribute('style', originalStyle);
          
          const combinedChartImage = canvas.toDataURL('image/png', 1.0);
          chartImagesArray.push({
            title: questionHeader,
            src: combinedChartImage,
            questionIndex: i,
            type: 'combined'
          });
          
          setStatusMessage(`Successfully captured question ${i+1}: ${questionHeader}`);
        } catch (error) {
          console.error(`Error capturing question ${i+1}:`, error);
          setStatusMessage(`Error capturing question ${i+1}: ${error.message}`);
        }
      }
      
      setStatusMessage(`Successfully captured ${chartImagesArray.length} charts`);
      setChartImages(chartImagesArray);
      return chartImagesArray;
    } catch (error) {
      console.error('Error capturing charts:', error);
      setStatusMessage(`Error capturing charts: ${error.message}`);
      return [];
    }
  };

  // Effect to capture charts when they change with better timing
  useEffect(() => {
    if (chartData.length > 0) {
      // Wait for charts to render before capturing
      const timer = setTimeout(() => {
        console.log("Charts should be rendered now, attempting capture...");
        captureCharts();
      }, 3000); // Increased timeout to ensure charts are fully rendered
      
      return () => clearTimeout(timer);
    }
  }, [chartData]);

  // Add a function to manually trigger chart capture
  const handleManualCaptureCharts = async () => {
    setStatusMessage('Manually capturing charts...');
    try {
      const capturedImages = await captureCharts();
      if (capturedImages && capturedImages.length > 0) {
        setStatusMessage(`Successfully captured ${capturedImages.length} charts. Ready to generate PDF.`);
      } else {
        setStatusMessage('No charts were captured. Please try again or check if charts are rendered.');
      }
    } catch (error) {
      console.error('Error in manual chart capture:', error);
      setStatusMessage(`Error in manual chart capture: ${error.message}`);
    }
  };

  // Remove an image
  const handleRemoveImage = (index) => {
    const newImageFiles = [...imageFiles];
    
    // Revoke the object URL to prevent memory leaks
    if (newImageFiles[index] && newImageFiles[index].preview) {
      URL.revokeObjectURL(newImageFiles[index].preview);
    }
    
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
    
    // Update formData as well
    setFormData({
      ...formData,
      images: newImageFiles.map(img => img.preview)
    });
  };

  // ✅ Handle Form Submission without resetting the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      
      // Check if we have chart data but no captured chart images
      if (chartData.length > 0 && (!chartImages || chartImages.length === 0)) {
        console.log("Charts not captured yet, attempting to capture before saving");
        setStatusMessage("Capturing charts before saving report...");
        await captureCharts();
      }
      
      // Create a copy of formData with reportType and latest chartImages added
      // Ensure organizer and resourcePerson are arrays
      const reportDataToSave = {
        ...formData,
        chartImages: chartImages,
        feedbackData: formData.feedbackData,
        excelData: formData.excelData,
        reportType: 'teaching',
        // Ensure organizer is an array
        organizer: Array.isArray(formData.organizer) 
          ? formData.organizer 
          : (formData.organizer ? [formData.organizer] : []),
        // Ensure resourcePerson is an array
        resourcePerson: Array.isArray(formData.resourcePerson)
          ? formData.resourcePerson
          : (formData.resourcePerson ? [formData.resourcePerson] : [])
      };
      
      console.log("Saving report with chart images:", reportDataToSave.chartImages?.length);
      console.log("Saving report with student data:", reportDataToSave.excelData?.length);
      console.log("Saving report with image URLs:", reportDataToSave.images?.length);
      console.log("Organizer data:", reportDataToSave.organizer);
      console.log("Resource Person data:", reportDataToSave.resourcePerson);
      
      const response = await axios.post("http://localhost:8000/api/reports", reportDataToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Report Created:", response.data);

      // Show success message
      setSaveSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error creating report:", error);
      let errorMessage = "Failed to save report.";
      
      if (error.response) {
        errorMessage += ` Server responded with: ${error.response.status} - ${error.response.data.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += " No response received from server. Please check your connection.";
      } else {
        errorMessage += ` Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Handle form reset
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form? All entered data will be lost.")) {
      // Clean up any object URLs to prevent memory leaks
      imageFiles.forEach(img => {
        if (img && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      
      setImageFiles([]);
      setFeedbackFile(null);
      setStudentDataFile(null);
      setChartData([]);
      setFormData(initialFormState);
    }
  };

  // Generate PDF using already uploaded Cloudinary URLs
  const handleGeneratePDF = async () => {
    try {
      setDownloadStatus("Preparing PDF...");
      
      // If we have chart data but no chart images, try capturing charts first
      if (chartData.length > 0 && (!chartImages || chartImages.length === 0)) {
        console.log("Charts not captured yet, attempting to capture before PDF generation");
        setStatusMessage("Capturing charts before PDF generation...");
        await captureCharts();
      }
      
      // No need to re-upload images to Cloudinary, they're already uploaded when the user selected them
      // Just check if we have any failed uploads that need to be retried
      const failedUploads = imageFiles.filter(img => img.uploadFailed);
      
      if (failedUploads.length > 0) {
        setDownloadStatus(`Retrying upload for ${failedUploads.length} failed image(s)...`);
        
        const cloudinaryUploadUrl = "https://api.cloudinary.com/v1_1/darnokazg/image/upload";
        const cloudinaryUploadPreset = "report_generator";
        
        // Only retry uploads for images that failed previously
        for (let i = 0; i < failedUploads.length; i++) {
          const imageItem = failedUploads[i];
          const file = imageItem.file;
          
          if (!file) {
            console.error("No file found in failed upload item:", imageItem);
            continue;
          }
          
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", cloudinaryUploadPreset);
            formData.append("folder", "report_images");
            
            setDownloadStatus(`Retrying upload ${i + 1} of ${failedUploads.length}...`);
            const response = await axios.post(cloudinaryUploadUrl, formData);
            
            // Update the image file entry
            const index = imageFiles.findIndex(img => img === imageItem);
            if (index !== -1) {
              const newImageFiles = [...imageFiles];
              newImageFiles[index] = {
                ...imageItem,
                cloudinaryUrl: response.data.secure_url,
                uploadFailed: false
              };
              setImageFiles(newImageFiles);
              
              // Also update formData.images
              const newImages = [...formData.images];
              newImages.push(response.data.secure_url);
              setFormData(prev => ({...prev, images: newImages}));
            }
          } catch (error) {
            console.error("Error retrying image upload:", error);
            setDownloadStatus(`Error retrying upload: ${error.message}`);
          }
        }
      }
      
      // Create final PDF data with all the information needed
      const pdfData = {
        ...formData,
        chartImages: chartImages,
        excelData: formData.excelData
      };
      
      setDownloadStatus("Generating PDF...");
      const blob = await pdf(<ReportPDF data={pdfData} />).toBlob();
      saveAs(blob, `${formData.title.replace(/\s+/g, "_")}_Report.pdf`);
      setDownloadStatus("PDF downloaded successfully!");
      setTimeout(() => setDownloadStatus(""), 2000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setDownloadStatus(`Error generating PDF: ${error.message}`);
      setTimeout(() => setDownloadStatus(""), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg transform transition duration-500 hover:scale-102">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Teaching Activity Report</h2>
        
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-200 rounded">
            Report saved successfully!
          </div>
        )}

        {/* Title Section */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Report Title:</label>
        <input
          type="text"
            placeholder="Title of the Innovative Teaching Learning Practice"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Academic Details Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-bold text-gray-800 mb-2">Academic Year:</label>
            <select
              required
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled hidden>
                Select Year
              </option>
              <option value="2015-2016">2015-2016</option>
              <option value="2016-2017">2016-2017</option>
              <option value="2017-2018">2017-2018</option>
              <option value="2018-2019">2018-2019</option>
              <option value="2019-2020">2019-2020</option>
              <option value="2020-2021">2020-2021</option>
              <option value="2021-2022">2021-2022</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2023-2024">2023-2024</option> 
              <option value="2024-2025">2024-2025</option> 
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>  
              <option value="2027-2028">2027-2028</option>
              <option value="2028-2029">2028-2029</option>
              <option value="2029-2030">2029-2030</option>
              <option value="2030-2031">2030-2031</option>
              <option value="2031-2032">2031-2032</option>
              <option value="2032-2033">2032-2033</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-gray-800 mb-2">Semester:</label>
            <select
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled hidden >Select Semester</option>
              <option value="1">Sem-1</option>
              <option value="2">Sem-2</option>
            </select>
          </div>
        </div>

        {/* Faculty & Subject Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-bold text-gray-800 mb-2">Subject Name:</label>
        <input
          type="text"
          placeholder="Subject Name"
          required
          value={formData.subjectName}
          onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
          </div>
          <div>
            <label className="block font-bold text-gray-800 mb-2">Faculty Name:</label>
        <input
          type="text"
          placeholder="Faculty Name"
          required
          value={formData.facultyName}
          onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
              className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Date:</label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Target Year */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Target Students:</label>
          <div className="flex space-x-4">
            {["F.E.", "S.E.", "T.E.", "B.E."].map((year) => (
              <label key={year} className="inline-flex items-center">
                <input
                  type="radio"
                  name="targetYear"
                  value={year}
                  checked={formData.targetYear === year}
                  onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">{year}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ✅ Participation Data */}
        <div className="border p-4 rounded-lg mb-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Participation Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Students in Class
              </label>
          <input
            type="number"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.participationData.totalStudents}
                onChange={(e) => setFormData({
                ...formData,
                  participationData: {
                    ...formData.participationData,
                    totalStudents: e.target.value
            }
                })}
          />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Provided To
              </label>
          <input
            type="number"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.participationData.materialProvidedTo}
                onChange={(e) => setFormData({
                ...formData,
                  participationData: {
                    ...formData.participationData,
                    materialProvidedTo: e.target.value
            }
                })}
          />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Students Participated
              </label>
          <input
            type="number"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.participationData.studentsParticipated}
                onChange={(e) => setFormData({
                ...formData,
                  participationData: {
                    ...formData.participationData,
                    studentsParticipated: e.target.value
                  }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participation Percentage
              </label>
              <input
                type="text"
                readOnly
                className="w-full p-2 border rounded bg-gray-50"
                value={`${formData.participationData.participationPercentage}%`}
              />
            </div>
          </div>
        </div>

        {/* ✅ Student Performance Data */}
        <div className="border p-4 rounded-lg mb-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Student Performance Data</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Student Performance Excel File (with Sr No, Roll Number, Name, Marks columns)
            </label>
            <div className="flex items-center">
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={studentDataInputRef}
                className="hidden"
                onChange={handleStudentDataUpload}
              />
              <button
                type="button"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                onClick={() => studentDataInputRef.current.click()}
                disabled={isProcessingStudentData}
              >
                <FaFileExcel className="mr-2" />
                {isProcessingStudentData ? "Processing..." : "Upload Excel"}
              </button>
              <button
                type="button"
                className="ml-2 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                onClick={() => {
                  const template = [
                    { 'Sr No': '', 'Roll Number': '', 'Name': '', 'Marks': '' }
                  ];
                  const ws = XLSX.utils.json_to_sheet(template);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Template");
                  XLSX.writeFile(wb, "teaching_activity_template.xlsx");
                }}
              >
                <FaFileExcel className="mr-2" />
                Download Template
              </button>
              {studentDataFile && (
                <span className="ml-3 text-sm text-gray-600">
                  {studentDataFile.name}
                </span>
              )}
            </div>

            {statusMessage && statusMessage.includes("student performance") && (
              <p className={`mt-2 text-sm ${statusMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                {statusMessage}
              </p>
            )}
          </div>

          {/* Preview of uploaded Excel data */}
          {formData.excelData && formData.excelData.length > 0 && (
            <div className="mt-4 border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Student performance data loaded for {formData.excelData.length} students</span>
                <button 
                  type="button"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => setFormData(prev => ({...prev, excelData: []}))}
                >
                  <FaTrash />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.excelData.slice(0, 5).map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{student['Sr No'] || index + 1}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{student['Roll Number']}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{student['Name']}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{student['Marks']}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs">{student['Performance']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {formData.excelData.length > 5 && (
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    {formData.excelData.length - 5} more records not shown
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Objectives */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Objectives:</label>
        {formData.objectives.map((objective, index) => (
            <div key={index} className="flex mb-2">
          <input
            type="text"
            value={objective}
            onChange={(e) => {
              const newObjectives = [...formData.objectives];
              newObjectives[index] = e.target.value;
              setFormData({ ...formData, objectives: newObjectives });
            }}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Objective ${index + 1}`}
              />
              {formData.objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newObjectives = [...formData.objectives];
                    newObjectives.splice(index, 1);
                    setFormData({ ...formData, objectives: newObjectives });
                  }}
                  className="ml-2 p-3 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              )}
            </div>
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, objectives: [...formData.objectives, ""] })}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
        >
            <span className="mr-1">+</span> Add Another Objective
        </button>
        </div>

        {/* ✅ Description Field */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Description of Activity:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Describe the teaching activity in detail..."
          />
        </div>

        {/* ✅ Learning Outcomes */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Learning Outcomes:</label>
          {formData.learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => {
                  const newOutcomes = [...formData.learningOutcomes];
                  newOutcomes[index] = e.target.value;
                  setFormData({ ...formData, learningOutcomes: newOutcomes });
                }}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Learning outcome ${index + 1}`}
              />
              {formData.learningOutcomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newOutcomes = [...formData.learningOutcomes];
                    newOutcomes.splice(index, 1);
                    setFormData({ ...formData, learningOutcomes: newOutcomes });
                  }}
                  className="ml-2 p-3 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, learningOutcomes: [...formData.learningOutcomes, ""] })}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className="mr-1">+</span> Add Another Learning Outcome
          </button>
        </div>

            

        {/* Snapshot Images Section */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Snapshots: About event conduction/live session</label>
          
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={uploadImagesToCloudinary}
            className="hidden"
            accept="image/*"
            multiple
          />
          
          {/* Custom upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="mb-4 flex items-center p-3 border-2 border-dashed border-blue-300 rounded-md text-blue-500 hover:text-blue-700 hover:border-blue-500"
            disabled={statusMessage && statusMessage.includes('Uploading')}
          >
            {statusMessage && statusMessage.includes('Uploading') ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading to Cloudinary...
              </>
            ) : (
              <>
                <FaUpload className="mr-2" /> Upload Event Snapshots
              </>
            )}
          </button>
          
          {/* Image preview section */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {imageFiles.map((img, index) => (
                <div key={index} className="relative border rounded-md overflow-hidden">
                  <img src={img.preview} alt={`Snapshot ${index + 1}`} className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

    <div className="mb-6">
      <label className="block font-bold text-gray-800 mb-2">Add Section:</label>
        {formData.extraSections && formData.extraSections.map((section, index) => (
      <div key={index} className="mb-6 border p-4 rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Additional Section {index + 1}</h3>
          <button 
            type="button"
            className="text-red-600 hover:text-red-800"
            onClick={() => {
              const newSections = [...formData.extraSections];
              newSections.splice(index, 1);
              setFormData(prev => ({...prev, extraSections: newSections}));
            }}
          >
            <FaTrash />
          </button>
        </div>
        <input
          type="text"
          placeholder="Section Title"
          value={section.title}
          className="block w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            setFormData((prevData) => {
              const updatedSections = [...prevData.extraSections];
              updatedSections[index].title = e.target.value;
              return { ...prevData, extraSections: updatedSections };
            })
          }
        />
        <textarea
          placeholder="Section Description"
          value={section.description}
          className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          onChange={(e) =>
            setFormData((prevData) => {
              const updatedSections = [...prevData.extraSections];
              updatedSections[index].description = e.target.value;
              return { ...prevData, extraSections: updatedSections };
            })
          }
        />
      </div>
    ))}
    <button 
      type="button" 
      className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
      onClick={() =>
        setFormData((prevData) => ({
          ...prevData,
          extraSections: [...(prevData.extraSections || []), { title: "", description: "" }]
        }))
      }
    >
      <span className="mr-1">+</span> Add Section
    </button>
    </div>
        {/* Feedback Excel Upload Section */}
        <div className="mb-6">
          <label className="block font-bold text-gray-800 mb-2">Feedback Data Analysis:</label>
          <p className="text-gray-600 mb-3">
            Upload an Excel file containing feedback data. The file should have column headers with questions containing "?" character. Each row should represent one student's responses.
          </p>
          
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={feedbackInputRef}
            onChange={handleFeedbackUpload}
            className="hidden"
            accept=".xlsx,.xls"
          />
          
          {/* Custom upload button */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => feedbackInputRef.current.click()}
              className="mb-4 flex items-center p-3 border-2 border-dashed border-green-300 rounded-md text-green-500 hover:text-green-700 hover:border-green-500"
              disabled={isProcessingFeedback}
            >
              {isProcessingFeedback ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Feedback Data...
                </>
              ) : (
                <>
                  <FaFileExcel className="mr-2" /> Upload Feedback Excel
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const template = [
                  {
                    'Sr No': "",
                    'Roll No': '',
                    'Name': '',
                    'A?': '',
                    'B?': '',
                    'C?': '',
                    'D?': ''
                  }
                ];
                const ws = XLSX.utils.json_to_sheet(template);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Feedback Template");
                XLSX.writeFile(wb, "teaching_activity_feedback_template.xlsx");
              }}
              className="mb-4 flex items-center p-3 border-2 border-dashed border-green-300 rounded-md text-green-500 hover:text-green-700 hover:border-green-500"
            >
              <FaFileExcel className="mr-2" /> Download Template
            </button>
          </div>
          
          {feedbackFile && (
            <div className="mt-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded flex items-center">
              <FaFileExcel className="mr-2" /> 
              <span className="font-medium">{feedbackFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFeedbackFile(null);
                  setChartData([]);
                  setFormData(prev => ({...prev, feedbackData: [], chartImages: []}));
                }}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>

        {/* Feedback Charts Display */}
        {chartData.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Feedback Charts</h3>
              <button
                type="button"
                onClick={handleManualCaptureCharts}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Capture Charts Manually
              </button>
            </div>
            
            <div ref={chartsContainerRef} id="chart-container" className="p-4 border border-gray-300 rounded-md">
              <FeedbackCharts chartsData={chartData} />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {(downloadStatus || statusMessage) && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 border border-blue-200 rounded flex items-center">
            {downloadStatus || statusMessage}
          </div>
        )}

        {/* Chart Preview */}
        {/* {chartImages && chartImages.length > 0 && (
          <div className="mb-6 border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Captured Charts Preview</h3>
            <p className="text-sm text-gray-600 mb-3">
              {chartImages.length} charts have been successfully captured and will be included in the PDF.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {chartImages.slice(0, 4).map((chart, index) => (
                <div key={index} className="border rounded-md p-2"> 
                  <p className="text-xs font-medium mb-1">{chart.title}</p>
                  <img 
                    src={chart.src} 
                    alt={chart.title} 
                    className="w-full h-auto max-h-48 object-contain"
                  />
                </div>
              ))}
              {chartImages.length > 4 && (
                <div className="border rounded-md p-4 flex items-center justify-center bg-gray-50">
                  <p className="text-sm text-gray-600">+{chartImages.length - 4} more charts captured</p>
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* ✅ Submit Button */}
        <div className="flex justify-between mt-6">
          <div>
            <button 
              type="button" 
              onClick={handleReset}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              Reset Form
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleGeneratePDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 flex items-center"
            >
              <FaFilePdf className="mr-2" /> Download PDF
            </button>
            
            {/* <button 
              type="button"
              onClick={() => generateWordReport(formData)}
              disabled={isGeneratingWord}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
            >
              {isGeneratingWord ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparing Word...
                </span>
              ) : (
                <><FaFileWord className="mr-2" /> Download Word</>
              )}
            </button> */}
            
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
            >
              Save Report
        </button>
          </div>
        </div>
        
        {/* Success message at the bottom of the form - similar to Expert Report */}
        {saveSuccess && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Teaching Report saved successfully!</span>
            </div>
            <p className="text-sm mt-1 ml-7">Your report has been saved. You can view it in the Previous Reports section or continue editing.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReportForm;