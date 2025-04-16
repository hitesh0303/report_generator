import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { FaArrowLeft, FaFilePdf, FaFileWord, FaUpload, FaTrash, FaPlus, FaFileExcel, FaCamera, FaChartBar, FaInfoCircle, FaCloudUploadAlt } from "react-icons/fa";
import ReportPDAPDFContainer from "./ReportPDAPDFContainer";
import FeedbackCharts from "./FeedbackCharts";
import { processExcelData, prepareChartData } from "../utils/feedbackAnalysis";
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import ErrorBoundary from "./ErrorBoundary";
import { uploadMultipleBase64ToCloudinary } from '../utils/cloudinaryUtils';
import CloudinaryUploader from './CloudinaryUploader';
import { apiService } from "../utils/axiosConfig";

const ReportPDA = () => {
  const initialFormState = {
    title: "",
    targetAudience: "",
    date: "",
    time: "",
    organizedBy: "",
    institution: "",
    venue: "",
    fee: "0",
    participants: "",
    faculty: [
      { name: "Mr. Sachin Pande", role: "Head – Professional Development Committee" },
      { name: "Mrs. Amruta Patil", role: "Member of PDA" },
      { name: "Mr. Vinit Tribhuvan", role: "Member of PDA" }
    ],
    students: [],
    objectives: [
      "Foster a competitive yet supportive environment to encourage skill showcasing and mutual learning.",
      "Assess participants' skills dynamically and challenge them in a lively quiz setting.",
      "Facilitate in-depth domain knowledge acquisition essential for success in future internships and placements."
    ],
    execution: "",
    outcomes: [
      "Participants will demonstrate improved proficiency in the assessed skills, indicating growth and development in their knowledge areas.",
      "Attendees will acquire a deeper understanding of the domain, enhancing their expertise and readiness for future internship and placement opportunities.",
      "The top scorers will be honored with a special gift, fostering a sense of achievement and motivation among participants."
    ],
    impactAnalysis: [
      "Enhanced problem solving and critical thinking",
      "Preparation for future tests for internships and placements",
      "Increased awareness of knowledge gaps",
      "Overall readiness for internships and placements"
    ],
    feedback: [
      "This test was really helpful for our Placement preparation",
      "Very good quality questions!",
      "Great experience",
      "Keep taking similar quizes",
      "Quiz level was medium and excellent quality of questions.",
      "Quiz is good but its too lengthy",
      "Best quiz ever!!"
    ],
    chartImages: [],
    excelData: [],
    feedbackData: [],
    categorizedImages: {
      team: [],
      winners: [],
      certificates: [],
      general: []
    },
    extraSections: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Update imageFiles to track categories
  const [imageFiles, setImageFiles] = useState({
    team: [],
    winners: [],
    certificates: [],
    general: []
  });
  const [excelFile, setExcelFile] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [wordError, setWordError] = useState(null);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const chartsContainerRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [chartImages, setChartImages] = useState([]);
  const feedbackInputRef = useRef(null);

  // Initialize dummy data for Excel and chart images
  useEffect(() => {
    // Remove the dummy data initialization to use user provided data instead
    setFormData(prevData => ({
      ...prevData,
      excelData: [], // Empty array instead of dummy data
      chartImages: [] // Empty array instead of dummy data
    }));
  }, []);

  // Handle image upload - now just for reference, not used in UI
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageFiles = [...imageFiles];
    
    files.forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      newImageFiles.push({
        file,
        preview: imageUrl,
        title: "Chart " + (newImageFiles.length + 1)
      });
    });
    
    setImageFiles(newImageFiles);
    
    // Update formData with image info
    setFormData({
      ...formData,
      chartImages: newImageFiles.map(img => ({ 
        src: img.preview,
        title: img.title
      }))
    });
  };

  // Parse Excel file for student performance data
  const parseStudentExcelData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Validate that the Excel has the expected columns
          if (jsonData.length > 0) {
            const firstRow = jsonData[0];
            const hasRequiredColumns = 
              ('Sr No' in firstRow || 'Roll No' in firstRow || 'Roll Number' in firstRow) && 
              ('Name' in firstRow) && 
              ('Marks' in firstRow || 'Score' in firstRow);
            
            if (!hasRequiredColumns) {
              reject(new Error('Excel file must contain "Sr No" (or "Roll No"/"Roll Number"), "Name", and "Marks" (or "Score") columns'));
              return;
            }
            
            // Normalize column names if needed
            const normalizedData = jsonData.map((row, index) => {
              const newRow = {};
              newRow['Sr No'] = row['Sr No'] || row['Roll No'] || row['Roll Number'] || (index + 1);
              newRow['Roll Number'] = row['Roll Number'] || row['Roll No'] || row['Sr No'] || `Student-${index + 1}`;
              newRow['Name'] = row['Name'] || `Student ${index + 1}`;
              newRow['Marks'] = row['Marks'] || row['Score'] || 0;
              return newRow;
            });
            
            resolve(normalizedData);
          } else {
            reject(new Error('Excel file is empty'));
          }
        } catch (error) {
          console.error("Error processing student performance Excel file:", error);
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

  // Handle student performance Excel file upload
  const handleStudentDataUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStatusMessage('Processing student performance data...');
      
      try {
        // Process the Excel file
        const performanceData = await parseStudentExcelData(file);
        setStatusMessage(`Successfully processed performance data for ${performanceData.length} students!`);
        
        // Update form data with student performance data
        setFormData({
          ...formData,
          excelData: performanceData
        });
      } catch (error) {
        console.error("Error processing student performance file:", error);
        setStatusMessage(`Error: ${error.message}`);
        alert("Failed to process student performance file. Please check the format and try again.");
      }
    }
  };

  // Handle Excel file upload - now just for reference, not used in UI
  const handleExcelUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setExcelFile(file);
      
      // In a real app, you would parse the Excel file here
      // For now, we'll just simulate with dummy data
      const dummyData = Array.from({ length: 10 }, (_, i) => ({
        'Sr No': i + 1,
        'Roll Number': `IT_${20000 + i}`,
        'Name': `Student ${i + 1}`,
        'Marks': Math.floor(Math.random() * 50) + 50
      }));
      
      setFormData({
        ...formData,
        excelData: dummyData
      });
    }
  };

  // Remove an image
  const handleRemoveImage = (index, category = 'general') => {
    console.log(`Removing image at index ${index} from ${category} category`);
    
    // Remove from imageFiles state
    setImageFiles(prevFiles => {
      // Create a deep copy of the current state to avoid reference issues
      const updatedFiles = { ...prevFiles };
      
      // Make sure the category exists and has images
      if (updatedFiles[category] && updatedFiles[category].length > index) {
        const newCategoryFiles = [...updatedFiles[category]];
        newCategoryFiles.splice(index, 1);
        updatedFiles[category] = newCategoryFiles;
        console.log(`Removed image from imageFiles. ${category} category now has ${newCategoryFiles.length} images`);
      } else {
        console.warn(`Could not find image at index ${index} in ${category} category`);
      }
      
      return updatedFiles;
    });
    
    // Also update formData
    setFormData(prevData => {
      // Make sure the category exists in categorizedImages
      if (!prevData.categorizedImages || !prevData.categorizedImages[category]) {
        console.warn(`Category ${category} not found in formData.categorizedImages`);
        return prevData;
      }
      
      // Make sure we have enough images to remove the specified index
      if (prevData.categorizedImages[category].length <= index) {
        console.warn(`Index ${index} out of bounds for ${category} category (length: ${prevData.categorizedImages[category].length})`);
        return prevData;
      }
      
      const updatedCategoryUrls = [...prevData.categorizedImages[category]];
      updatedCategoryUrls.splice(index, 1);
      
      console.log(`Removed image URL from formData. ${category} category now has ${updatedCategoryUrls.length} image URLs`);
      
      return {
        ...prevData,
        categorizedImages: {
          ...prevData.categorizedImages,
          [category]: updatedCategoryUrls
        }
      };
    });
  };

  // Handle updating image title
  const handleImageTitleChange = (index, newTitle) => {
    const newImageFiles = [...imageFiles];
    newImageFiles[index].title = newTitle;
    setImageFiles(newImageFiles);
    
    setFormData({
      ...formData,
      chartImages: newImageFiles.map(img => ({ 
        src: img.preview,
        title: img.title
      }))
    });
  };

  // Handle Excel file upload for feedback data
  const handleFeedbackUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setExcelFile(file);
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
        setStatusMessage('No chart items found to capture. Please upload feedback data first.');
        return;
      }

      // Process each question container separately
      for (let i = 0; i < chartItemElements.length; i++) {
        const itemElement = chartItemElements[i];
        const questionHeader = itemElement.querySelector('h4')?.textContent || `Question ${i+1}`;
        
        // Update status with current chart index
        setStatusMessage(`Capturing chart ${i+1}/${chartItemElements.length}: ${questionHeader}...`);
        
        // Capture the entire chart item (both bar and pie charts together)
        try {
          // Add temporary styling to make content more compact for capture
          const originalStyle = itemElement.getAttribute('style') || '';
          itemElement.setAttribute('style', `${originalStyle}; background-color: white; padding: 10px; border-radius: 8px;`);
          
          // Use html2canvas to capture the element
          const canvas = await html2canvas(itemElement, {
            scale: 2, // Higher resolution
            logging: false,
            backgroundColor: 'white',
            useCORS: true
          });
          
          // Restore original styling
          itemElement.setAttribute('style', originalStyle);
          
          // Convert to image
          const imageData = canvas.toDataURL('image/png');
          
          // Store the image data
          chartImagesArray.push({
            title: questionHeader,
            src: imageData
          });
          
          setStatusMessage(`Captured chart ${i+1}/${chartItemElements.length}`);
        } catch (captureError) {
          console.error(`Error capturing chart ${i+1}:`, captureError);
          setStatusMessage(`Error capturing chart ${i+1}: ${captureError.message}`);
        }
      }
      
      if (chartImagesArray.length > 0) {
        setStatusMessage(`Successfully captured ${chartImagesArray.length} charts!`);
        
        // Skip Cloudinary upload for charts - store locally instead
        setFormData(prevState => ({
          ...prevState,
          chartImages: chartImagesArray
        }));
        
        // Update local state with chart images
        setChartImages(chartImagesArray);
        
        setStatusMessage(`✅ Successfully captured ${chartImagesArray.length} charts! These will be included in your PDF report.`);
        
        // Scroll to feedback charts section with smooth animation
        setTimeout(() => {
          const feedbackChartSection = document.getElementById('feedback-charts-container');
          if (feedbackChartSection) {
            feedbackChartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 1000);
        
        return chartImagesArray;
      } else {
        setStatusMessage('No charts were captured. Please check your feedback data.');
        return [];
      }
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
        setStatusMessage(`Successfully captured ${capturedImages.length} feedback charts! Charts will be included in the PDF report.`);
      } else {
        setStatusMessage('No charts were captured. Please try again or check if charts are rendered.');
      }
    } catch (error) {
      console.error('Error in manual chart capture:', error);
      setStatusMessage(`Error in manual chart capture: ${error.message}`);
    }
  };

  // Handle PDF generation using a more reliable method
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    setPdfError(null);
    
    try {
      // If there's chart data but no chart images, try to capture charts first
      if (chartData.length > 0 && (!chartImages || chartImages.length === 0)) {
        setStatusMessage('Capturing charts before generating PDF...');
        await captureCharts();
      }
      
      // Create the PDF document using our container component
      const pdfDoc = <ReportPDAPDFContainer data={formData} />;
      const asPdf = pdf();
      asPdf.updateContainer(pdfDoc);
      const blob = await asPdf.toBlob();
      
      // Create a URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PDA_Report_${formData.title.replace(/\s+/g, "_") || "report"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfError(error.message || "Failed to generate PDF");
      setIsGeneratingPDF(false);
    }
  };

  // Generate Word document
  const generateWordReport = async () => {
    setIsGeneratingWord(true);
    setWordError(null);
    
    try {
      const sections = [];
      
      // Header section
      const commonSection = {
        properties: {},
        children: [
          new Paragraph({ text: "PUNE INSTITUTE OF COMPUTER TECHNOLOGY", heading: "Title" }),
          new Paragraph({ text: "Department: Information Technology", bold: true }),
          new Paragraph(new TextRun({ text: `Date: ${formData.date || 'N/A'}`, bold: true })),
          new Paragraph({ text: formData.title || 'N/A', heading: "Heading1" }),
          new Paragraph(`Target Audience: ${formData.targetAudience || 'N/A'}`),
          new Paragraph(`Organized By: ${formData.organizedBy || 'N/A'}`),
          new Paragraph(`Venue: ${formData.venue || 'N/A'}`),
          new Paragraph(`Time: ${formData.time || 'N/A'}`),
          new Paragraph(`Number of Participants: ${formData.participants || 'N/A'}`),
          new Paragraph(""),
          new Paragraph({ text: "Faculty Members:", heading: "Heading2" })
        ]
      };
      
      // Add faculty members
      if (formData.faculty && formData.faculty.length > 0) {
        formData.faculty.forEach((faculty, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${faculty.name} (${faculty.role})`));
        });
      }
      
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "Student Members:", heading: "Heading2" })
      );
      
      // Add student members
      if (formData.students && formData.students.length > 0) {
        formData.students.forEach((student, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${student}`));
        });
      }
      
      // Add other PDA-specific sections
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "Objectives:", heading: "Heading2" })
      );
      
      if (formData.objectives && formData.objectives.length > 0) {
        formData.objectives.forEach((obj, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${obj}`));
        });
      }
      
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "Execution:", heading: "Heading2" }),
        new Paragraph(formData.execution || 'N/A'),
        new Paragraph(""),
        new Paragraph({ text: "Outcomes:", heading: "Heading2" })
      );
      
      if (formData.outcomes && formData.outcomes.length > 0) {
        formData.outcomes.forEach((outcome, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${outcome}`));
        });
      }
      
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "Impact Analysis:", heading: "Heading2" })
      );
      
      if (formData.impactAnalysis && formData.impactAnalysis.length > 0) {
        formData.impactAnalysis.forEach((impact, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${impact}`));
        });
      }
      
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "Feedback Analysis:", heading: "Heading2" })
      );
      
      if (formData.feedback && formData.feedback.length > 0) {
        formData.feedback.forEach((fb, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${fb}`));
        });
      }
      
      sections.push(commonSection);
      
      const doc = new Document({
        sections: sections,
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `PDA_Report_${formData.title.replace(/\s+/g, "_")}.docx`);
      
      setIsGeneratingWord(false);
      return true;
    } catch (error) {
      console.error("Error generating Word document:", error);
      setWordError(error.message || "Failed to generate Word document");
      setIsGeneratingWord(false);
      return false;
    }
  };

  // Add a function to handle categorized image uploads
  const handleCategorizedImageUpload = (uploadedImages, category) => {
    // Default to 'general' if no category is provided
    const imageCategory = category || 'general';
    
    console.log(`Received ${uploadedImages.length} uploaded images in category: ${imageCategory}`);
    
    // Update the imageFiles state with the new uploads - ensure we only add to specific category
    setImageFiles(prevFiles => {
      // Create a deep copy of the current state to avoid reference issues
      const updatedFiles = { ...prevFiles };
      
      // Add new images to the appropriate category
      updatedFiles[imageCategory] = [
        ...prevFiles[imageCategory], 
        ...uploadedImages
      ];
      
      console.log(`Updated imageFiles state: ${imageCategory} category now has ${updatedFiles[imageCategory].length} images`);
      return updatedFiles;
    });
    
    // Also update the formData with the Cloudinary URLs
    setFormData(prevData => {
      // Get the existing categorized images or initialize if not present
      const existingCategorizedImages = prevData.categorizedImages || {
        team: [],
        winners: [],
        certificates: [],
        general: []
      };
      
      // Add the new image URLs to the appropriate category
      const updatedCategorizedImages = {
        ...existingCategorizedImages,
        [imageCategory]: [
          ...existingCategorizedImages[imageCategory],
          ...uploadedImages.map(img => img.original)
        ]
      };
      
      console.log(`Updated formData: ${imageCategory} category now has ${updatedCategorizedImages[imageCategory].length} image URLs`);
      
      return {
        ...prevData,
        categorizedImages: updatedCategorizedImages
      };
    });
    
    setStatusMessage(`Successfully added ${uploadedImages.length} images to the ${imageCategory} category!`);
  };

  // ✅ Handle Form Submission
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
      
      // Flatten all image URLs for backward compatibility
      const allImageUrls = [
        ...(formData.categorizedImages.team || []),
        ...(formData.categorizedImages.winners || []),
        ...(formData.categorizedImages.certificates || []),
        ...(formData.categorizedImages.general || [])
      ];
      
      // Create a copy of formData with latest data
      const reportDataToSave = {
        ...formData,
        images: allImageUrls, // Use all Cloudinary URLs (flattened for backward compatibility)
        chartImages: chartImages, // Use local base64 images for charts
        reportType: 'pda'
      };
      
      console.log("Saving PDA report with chart images:", reportDataToSave.chartImages?.length);
      console.log("Saving PDA report with uploaded images:", reportDataToSave.images?.length);
      console.log("Saving PDA report with categorized images:", {
        team: formData.categorizedImages.team?.length || 0,
        winners: formData.categorizedImages.winners?.length || 0,
        certificates: formData.categorizedImages.certificates?.length || 0,
        general: formData.categorizedImages.general?.length || 0
      });
      
      const response = await apiService.createReport(reportDataToSave);

      console.log("PDA Report Created:", response);

      // Show success message
      setSaveSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error creating PDA report:", error);
      let errorMessage = "Failed to save PDA report.";
      
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
      // Reset all state variables
      setFormData(initialFormState);
      setImageFiles({
        team: [],
        speakers: [],
        certificates: [],
        general: []
      });
      setExcelFile(null);
      setFeedbackFile(null);
      setChartData([]);
      setChartImages([]);
      setStatusMessage("");
      setSaveSuccess(false);
      setPdfError(null);
      setWordError(null);
      setIsGeneratingPDF(false);
      setIsGeneratingWord(false);
      setIsProcessingFeedback(false);
      setIsProcessingStudentData(false);
      
      // Reset file input refs
      if (feedbackInputRef.current) feedbackInputRef.current.value = '';
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  // Handle array field updates (update for faculty to handle name and role)
  const handleArrayItemChange = (field, index, value, subfield = null) => {
    if (field === 'faculty' && subfield) {
      const newArray = [...formData[field]];
      newArray[index] = { ...newArray[index], [subfield]: value };
      setFormData({ ...formData, [field]: newArray });
    } else {
      const newArray = [...formData[field]];
      newArray[index] = value;
      setFormData({ ...formData, [field]: newArray });
    }
  };

  // Add new item to array field (updated for faculty)
  const handleAddArrayItem = (field) => {
    if (field === 'faculty') {
      const newArray = [...formData[field], { name: "", role: "" }];
      setFormData({ ...formData, [field]: newArray });
    } else {
      const newArray = [...formData[field], ""];
      setFormData({ ...formData, [field]: newArray });
    }
  };

  // Remove item from array field
  const handleRemoveArrayItem = (field, index) => {
    if (formData[field].length <= 1) return;
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg transform transition duration-500 hover:scale-102">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create PDA Report</h2>
        
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-200 rounded">
            PDA Report saved successfully!
          </div>
        )}

        {/* Status Messages with improved styling based on message content */}
        {statusMessage && (
          <div className={`mb-4 p-3 rounded-md shadow-sm flex items-center ${
            statusMessage.includes('Successfully') || statusMessage.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-300'
              : statusMessage.includes('Error') || statusMessage.includes('No charts')
                ? 'bg-red-100 text-red-700 border border-red-300'
                : statusMessage.includes('Starting') || statusMessage.includes('Capturing') || statusMessage.includes('Found')
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {statusMessage.includes('Successfully') || statusMessage.includes('✅') ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : statusMessage.includes('Error') || statusMessage.includes('No charts') ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="animate-spin h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Basic Event Information */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Event Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold text-gray-800 mb-2">Report Title:</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter report title (e.g., A Knowledge Assessment Quiz-Internship and Placement Preparation)"
              />
            </div>
            
            <div>
              <label className="block font-bold text-gray-800 mb-2">Target Audience:</label>
              <input
                type="text"
                required
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter target audience (e.g., Third Year and Second Year Students of IT Department)"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold text-gray-800 mb-2">Date:</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-bold text-gray-800 mb-2">Time</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={formData.time.split(" to ")[0]?.replace(/\s*(am|pm)/i, "") || ""}
                  onChange={(e) => {
                    const startTime = e.target.value;
                    const endTime = formData.time.split(" to ")[1] || "";
                    setFormData({ 
                      ...formData, 
                      time: startTime ? `${startTime}${endTime ? " to " + endTime : ""}` : "" 
                    });
                  }}
                  className="block w-full p-3 border border-gray-300 rounded -md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={formData.time.split(" to ")[1]?.replace(/\s*(am|pm)/i, "") || ""}
                  onChange={(e) => {
                    const startTime = formData.time.split(" to ")[0] || "";
                    const endTime = e.target.value;
                    setFormData({ 
                      ...formData, 
                      time: `${startTime}${endTime ? " to " + endTime : ""}` 
                    });
                  }}
                  className="block w-full p-3 border border-gray-300 rounded -md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block font-bold text-gray-800 mb-2">Venue:</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter venue (e.g., Google form, Seminar Hall, etc.)"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-2">Institution:</label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter institution name (e.g., Pune Institute of Computer Technology)"
              />
            </div>
            
            <div>
              <label className="block font-bold text-gray-800 mb-2">Organized By (Committee Name):</label>
              <input
                type="text"
                required
                value={formData.organizedBy}
                onChange={(e) => setFormData({ ...formData, organizedBy: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organizing committee name (e.g., Professional Development Activity Committee)"
              />
            </div>
            
            <div>
              <label className="block font-bold text-gray-800 mb-2">Number of Participants:</label>
              <input
                type="text"
                required
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number of participants"
              />
            </div>
          </div>
        </div>

        {/* Faculty Members */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Faculty Members (Organizers)</h3>
          <p className="text-gray-600 mb-3">
            Enter the faculty members and their respective roles who organized this event.
          </p>
          
          {formData.faculty.map((faculty, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 p-3 border border-gray-200 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name:</label>
                <input
                  type="text"
                  value={faculty.name}
                  onChange={(e) => handleArrayItemChange('faculty', index, e.target.value, 'name')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={index === 0 ? "Mr. Sachin Pande" : 
                             index === 1 ? "Mrs. Amruta Patil" : 
                             index === 2 ? "Mr. Vinit Tribhuvan" : "Faculty Name"}
                />
              </div>
              
              <div className="flex items-center">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role:</label>
                  <input
                    type="text"
                    value={faculty.role}
                    onChange={(e) => handleArrayItemChange('faculty', index, e.target.value, 'role')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={index === 0 ? "Head – Professional Development Committee" : 
                               index === 1 ? "Member of PDA" : 
                               index === 2 ? "Member of PDA" : "Faculty Role"}
                  />
                </div>
                
                {formData.faculty.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem('faculty', index)}
                    className="ml-3 p-2 text-red-500 hover:text-red-700 self-end"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('faculty')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className='mr-1'>+</span> Add Faculty Member
          </button>
        </div>

        {/* Student Members */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Student Members</h3>
          
          {formData.students.map((student, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={student}
                onChange={(e) => handleArrayItemChange('students', index, e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student name"
              />
              {formData.students.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('students', index)}
                  className="ml-2 p-3 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('students')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className='mr-1'>+</span> Add Student Member
          </button>
        </div>

        {/* Objectives */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Objectives</h3>
          
          {formData.objectives.map((objective, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleArrayItemChange('objectives', index, e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={index === 0 ? "Foster a competitive yet supportive environment to encourage skill showcasing and mutual learning." : 
                            index === 1 ? "Assess participants' skills dynamically and challenge them in a lively quiz setting." : 
                            index === 2 ? "Facilitate in-depth domain knowledge acquisition essential for success in future internships and placements." : 
                            `Objective ${index + 1}`}
              />
              {formData.objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('objectives', index)}
                  className="ml-2 p-3 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('objectives')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className='mr-1'>+</span> Add Objective
          </button>
        </div>

        {/* Execution */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Execution</h3>
          
          <textarea
            value={formData.execution}
            onChange={(e) => setFormData({ ...formData, execution: e.target.value })}
            className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Describe how the activity was executed (e.g., A knowledge assessment quiz to help students in placement and internship selection process, was held on the specified date from 9:00pm. The quiz focused on data structures and algorithms.)"
          />
        </div>

        {/* Outcomes */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Outcomes</h3>
          
          {formData.outcomes.map((outcome, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleArrayItemChange('outcomes', index, e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={index === 0 ? "Participants will demonstrate improved proficiency in the assessed skills, indicating growth and development in their knowledge areas." : 
                            index === 1 ? "Attendees will acquire a deeper understanding of the domain, enhancing their expertise and readiness for future internship and placement opportunities." : 
                            index === 2 ? "The top scorers will be honored with a special gift, fostering a sense of achievement and motivation among participants." : 
                            `Outcome ${index + 1}`}
              />
              {formData.outcomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('outcomes', index)}
                  className="ml-2 p-3 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('outcomes')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className='mr-1'>+</span> Add Outcome
          </button>
        </div>

        {/* Impact Analysis */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Impact Analysis</h3>
          
          {formData.impactAnalysis.map((impact, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={impact}
                onChange={(e) => handleArrayItemChange('impactAnalysis', index, e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={index === 0 ? "Enhanced problem solving and critical thinking" : 
                            index === 1 ? "Preparation for future tests for internships and placements" : 
                            index === 2 ? "Increased awareness of knowledge gaps" : 
                            index === 3 ? "Overall readiness for internships and placements" : 
                            `Impact ${index + 1}`}
              />
              {formData.impactAnalysis.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('impactAnalysis', index)}
                  className="ml-2 p-3 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('impactAnalysis')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className='mr-1'>+</span> Add Impact
          </button>
        </div>

        {/* Student Performance Excel Upload Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Student Performance Data</h3>
          <p className="text-gray-600 mb-3">
            Upload an Excel file containing student performance data. The file should have columns for Roll Number, Name, and Marks/Score.
          </p>
          
          {/* Student performance file input */}
          <input 
            type="file" 
            id="studentDataInput"
            onChange={handleStudentDataUpload}
            className="hidden" 
            accept=".xlsx,.xls"
            ref={(el) => excelInputRef.current = el}
          />
          
          {/* Custom upload button */}
          <button
            type="button"
            onClick={() => excelInputRef.current && excelInputRef.current.click()}
            className="mb-2 ml-2 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <FaFileExcel className="mr-2" /> Upload Student Performance Excel
          </button>
          
          <button
            type="button"
            onClick={() => {
              const template = [
                { 'Sr No': '', 'Roll Number': '', 'Name': '', 'Score': '' }
              ];
              const ws = XLSX.utils.json_to_sheet(template);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Template");
              XLSX.writeFile(wb, "pda_performance_template.xlsx");
            }}
            className="ml-2 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            <FaFileExcel className="mr-2" /> Download Template
          </button>
          
          {formData.excelData && formData.excelData.length > 0 && (
            <div className="mt-2">
              <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded flex items-center mb-2">
                <FaFileExcel className="mr-2" /> 
                <span className="font-medium">Student performance data loaded for {formData.excelData.length} students</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, excelData: []}))}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
              
              {/* Preview of student performance data */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.excelData.slice(0, 5).map((student, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{student['Sr No']}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{student['Roll Number']}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{student['Name']}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{student['Marks']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {formData.excelData.length > 5 && (
                  <div className="px-6 py-2 text-center text-sm text-gray-500">
                    {formData.excelData.length - 5} more records not shown
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Excel Upload Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Feedback Data Analysis</h3>
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
                XLSX.writeFile(wb, "pda_feedback_template.xlsx");
              }}
              className="mb-4 flex items-center p-3 border-2 border-dashed border-green-300 rounded-md text-green-500 hover:text-green-700 hover:border-green-500"
            >
              <FaFileExcel className="mr-2" /> Download Template
            </button>
          </div>
          
          {excelFile && (
            <div className="mt-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded flex items-center">
              <FaFileExcel className="mr-2" /> 
              <span className="font-medium">{excelFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setExcelFile(null);
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
                className={`px-3 py-1 ${
                  chartData.length > 0 && (!chartImages || chartImages.length === 0)
                    ? "bg-green-500 text-white font-medium text-sm rounded hover:bg-green-600 animate-pulse transition-all duration-300 transform hover:scale-105 shadow-md"
                    : "bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                } flex items-center`}
              >
                {chartData.length > 0 && (!chartImages || chartImages.length === 0) ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Capture Charts (Required)
                  </>
                ) : (
                  <>Capture Charts Manually</>
                )}
              </button>
            </div>
            
            <div ref={chartsContainerRef} id="chart-container" className="p-4 border border-gray-300 rounded-md">
              <FeedbackCharts chartsData={chartData} />
              
              {/* Success message for captured charts */}
              {chartImages && chartImages.length > 0 && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md shadow-sm">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Successfully captured {chartImages.length} feedback charts!</span>
                  </div>
                  <p className="text-sm mt-1 ml-7">Charts will be included in the PDF report. You can now download the PDF or save the report.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Descriptive Feedback */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Descriptive Feedback</h3>
          
          {formData.feedback.map((item, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayItemChange('feedback', index, e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={index === 0 ? "This test was really helpful for our Placement preparation" : 
                            index === 1 ? "Very good quality questions!" : 
                            index === 2 ? "Great experience" : 
                            index === 3 ? "Keep taking similar quizes" : 
                            index === 4 ? "Quiz level was medium and excellent quality of questions." : 
                            index === 5 ? "Quiz is good but its too lengthy" : 
                            index === 6 ? "Best quiz ever!!" : 
                            `Feedback ${index + 1}`}
              />
              {formData.feedback.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('feedback', index)}
                  className="ml-2 p-3 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('feedback')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <FaPlus className="mr-1" /> Add Feedback
          </button>
        </div>

        {/* PDA Images Section */}
        <div className="border p-4 rounded-lg mb-4 bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-6">PDA Event Images</h3>
          
          {/* Image category tabs */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Upload Images by Category</h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload images for each category separately. These will be used in different sections of the PDF report.
            </p>
            
            <div className="space-y-6">
              {/* Team Images */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-2 text-blue-800">Team Images</h5>
                <p className="text-sm text-gray-600 mb-3">Upload images of team members, organizers, and participants.</p>
                <CloudinaryUploader 
                  onUploadSuccess={(images) => handleCategorizedImageUpload(images, 'team')}
                  onUploadError={(error) => {
                    console.error("Cloudinary upload failed:", error);
                    setStatusMessage(`Team image upload failed: ${error.message}`);
                  }}
                  buttonText="Upload Team Images"
                  folder="pda_images"
                  maxFiles={5}
                  category="team"
                  className="mb-2"
                />
                
                {/* Team Images Preview */}
                {imageFiles.team && imageFiles.team.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imageFiles.team.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.thumbnail || file.preview || file.original} 
                            alt={`Team ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, 'team')}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Winners Images */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-2 text-green-800">Winners Images</h5>
                <p className="text-sm text-gray-600 mb-3">Upload images of award ceremonies, winners, and achievements.</p>
                <CloudinaryUploader 
                  onUploadSuccess={(images) => handleCategorizedImageUpload(images, 'winners')}
                  onUploadError={(error) => {
                    console.error("Cloudinary upload failed:", error);
                    setStatusMessage(`Winners image upload failed: ${error.message}`);
                  }}
                  buttonText="Upload Winners Images"
                  folder="pda_images"
                  maxFiles={5}
                  category="winners"
                  className="mb-2"
                />
                
                {/* Winners Images Preview */}
                {imageFiles.winners && imageFiles.winners.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imageFiles.winners.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.thumbnail || file.preview || file.original} 
                            alt={`Winner ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, 'winners')}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Certificates Images */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-2 text-blue-800">Certificates Images</h5>
                <p className="text-sm text-gray-600 mb-3">Upload images of certificates, recognition, and formal documents.</p>
                <CloudinaryUploader 
                  onUploadSuccess={(images) => handleCategorizedImageUpload(images, 'certificates')}
                  onUploadError={(error) => {
                    console.error("Cloudinary upload failed:", error);
                    setStatusMessage(`Certificates image upload failed: ${error.message}`);
                  }}
                  buttonText="Upload Certificate Images"
                  folder="pda_images"
                  maxFiles={5}
                  category="certificates"
                  className="mb-2"
                />
                
                {/* Certificates Images Preview */}
                {imageFiles.certificates && imageFiles.certificates.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imageFiles.certificates.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.thumbnail || file.preview || file.original} 
                            alt={`Certificate ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, 'certificates')}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* General Images */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-2 text-gray-800">Other Images</h5>
                <p className="text-sm text-gray-600 mb-3">Upload any other event-related images.</p>
                <CloudinaryUploader 
                  onUploadSuccess={(images) => handleCategorizedImageUpload(images, 'general')}
                  onUploadError={(error) => {
                    console.error("Cloudinary upload failed:", error);
                    setStatusMessage(`Image upload failed: ${error.message}`);
                  }}
                  buttonText="Upload Other Images"
                  folder="pda_images"
                  maxFiles={5}
                  category="general"
                  className="mb-2"
                />
                
                {/* General Images Preview */}
                {imageFiles.general && imageFiles.general.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imageFiles.general.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.thumbnail || file.preview || file.original} 
                            alt={`Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, 'general')}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add the following section after the Impact Analysis section in the form UI */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Additional Sections</h3>
          <p className="text-gray-600 mb-4">Add any additional sections that you want to include in the report.</p>
          
          {formData.extraSections.map((section, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const newExtraSections = [...formData.extraSections];
                    newExtraSections[index].title = e.target.value;
                    setFormData({ ...formData, extraSections: newExtraSections });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter section title"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    const newExtraSections = [...formData.extraSections];
                    newExtraSections[index].description = e.target.value;
                    setFormData({ ...formData, extraSections: newExtraSections });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter section description"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newExtraSections = formData.extraSections.filter((_, i) => i !== index);
                  setFormData({ ...formData, extraSections: newExtraSections });
                }}
                className="text-red-600 hover:text-red-800 flex items-center text-sm"
              >
                <FaTrash className="mr-1" /> Remove Section
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                extraSections: [
                  ...formData.extraSections,
                  { title: '', description: '' }
                ]
              });
            }}
            className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <span className="mr-1">+</span> Add Section
          </button>
        </div>

        {/* Submit Button */}
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
            <ErrorBoundary
              fallback={
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 flex items-center"
                  onClick={() => {
                    setPdfError(null);
                    handleGeneratePDF();
                  }}
                >
                  Try PDF generation again
                </button>
              }
            >
              <button
                type="button"
                disabled={isGeneratingPDF || (chartData.length > 0 && (!chartImages || chartImages.length === 0))}
                onClick={handleGeneratePDF}
                className={`${
                  chartData.length > 0 && (!chartImages || chartImages.length === 0)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } text-white px-4 py-2 rounded-lg transition duration-300 flex items-center relative group`}
              >
                {isGeneratingPDF ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing PDF...
                  </span>
                ) : (
                  <><FaFilePdf className="mr-2" /> Download PDF</>
                )}
                {chartData.length > 0 && (!chartImages || chartImages.length === 0) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center pointer-events-none">
                    Please capture charts first by clicking the "Capture Charts Manually" button
                  </div>
                )}
              </button>
            </ErrorBoundary>
            
            {/* <ErrorBoundary
              fallback={
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 flex items-center"
                  onClick={() => {
                    setWordError(null);
                    generateWordReport();
                  }}
                >
                  Try Word generation again
                </button>
              }
            >
              <button
                type="button"
                disabled={isGeneratingWord}
                onClick={generateWordReport}
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
              </button>
            </ErrorBoundary> */}
            
            {pdfError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-sm mt-2">
                Error: {pdfError}
              </div>
            )}
            {wordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-sm mt-2">
                Error: {wordError}
              </div>
            )}
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Save PDA Report
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
              <span className="font-medium">PDA Report saved successfully!</span>
            </div>
            <p className="text-sm mt-1 ml-7">Your report has been saved. You can view it in the Previous Reports section or continue editing.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReportPDA; 