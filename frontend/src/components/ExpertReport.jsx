import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import Chart from 'chart.js/auto';
import { RadarController, RadialLinearScale, PointElement, LineElement } from 'chart.js';
import { FaCloudUploadAlt, FaFileExcel, FaImage, FaChartBar, FaFileDownload, FaCheckCircle, FaTimes, FaSave, FaFilePdf, FaTrash, FaPlus, FaSpinner, FaArrowLeft, FaFileWord, FaInfoCircle } from 'react-icons/fa';
import ExpertReportPDFContainer from './ExpertReportPDFContainer';
import CloudinaryUploader from './CloudinaryUploader';
import ErrorBoundary from './ErrorBoundary';
import { processExcelData, prepareChartData } from '../utils/feedbackAnalysis';
import FeedbackCharts from './FeedbackCharts';
import api, { apiService } from '../utils/axiosConfig';
import { Document, Packer, Paragraph, TextRun } from "docx";

// Register Chart.js components (if not using chart.js/auto)
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement);

// Original component with all functionality
const ExpertReportFull = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const feedbackInputRef = useRef(null);
  const chartsContainerRef = useRef(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    title: "",
    eventDate: "",
    eventTime: "",
    organizer: [""],
    courseName: "",
    mode: "",
    link: "",
    participants: "",
    objectives: [""],
    outcomes: [""],
    coPoMapping: [],
    resourcePerson: [""],
    impactAnalysis: [
      { title: "Knowledge Enhancement", content: "" },
      { title: "Awareness", content: "" },
      { title: "Skill Development", content: "" },
      { title: "Career Influence", content: "" },
      { title: "Student Feedback", content: "" }
    ],
    excelData: [],
    feedbackData: [],
    chartImages: [],
    keyFeedbackPoints: [],
    performanceMetrics: [],
    feedbackCount: 0,
    averageRating: 0,
    netPromoterScore: 0,
    categorizedImages: {
      team: [],
      speakers: [],
      certificates: []
    },
    extraSections: []
  });

  // States for UI handling
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [processingFeedback, setProcessingFeedback] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [chartImages, setChartImages] = useState([]);
  const [chartContainer, setChartContainer] = useState(null);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [wordError, setWordError] = useState(null);
  
  // Update imageFiles to track categories like in PDA
  const [imageFiles, setImageFiles] = useState({
    team: [],
    speakers: [],
    certificates: []
  });

  // Handle changes to array fields (like objectives, outcomes)
  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  // Add new item to array field
  const handleAddArrayItem = (field) => {
    if (field === 'coPoMapping') {
      const newMapping = { code: "", description: "" };
      setFormData({ ...formData, [field]: [...formData[field], newMapping] });
    } else if (field === 'impactAnalysis') {
      const newImpact = { title: "", content: "" };
      setFormData({ ...formData, [field]: [...formData[field], newImpact] });
    } else {
      setFormData({ ...formData, [field]: [...formData[field], ""] });
    }
  };

  // Remove item from array field
  const handleRemoveArrayItem = (field, index) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  // Handle changes to nested object fields (like coPoMapping and impactAnalysis)
  const handleNestedObjectChange = (field, index, key, value) => {
    const newArray = [...formData[field]];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData({ ...formData, [field]: newArray });
  };

  // Handle Excel file upload for student data
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setStatusMessage('Processing Excel file...');
      console.log("ExpertReport: Starting Excel file processing:", file.name);
      
      const data = await parseExcelFile(file);
      
      // Validate if the data has the required columns
      if (!data.validFormat) {
        const errorMsg = `Invalid Excel format. The file must contain columns: Sr No, Full Name, User Action, and TimeStamp. Columns found: ${data.columns.join(', ')}`;
        console.error("ExpertReport: Excel format validation failed:", errorMsg);
        setStatusMessage('');
        
        // Show popup alert with error message
        alert(errorMsg);
        
        // Reset the file input
        if (excelInputRef.current) {
          excelInputRef.current.value = "";
        }
        return;
      }
      
      console.log("ExpertReport: Excel data parsed successfully. Row count:", data.data.length);
      
      // Log sample of the parsed data
      if (data.data.length > 0) {
        console.log("ExpertReport: First row columns:", Object.keys(data.data[0]));
        console.log("ExpertReport: Sample data (first 2 rows):", data.data.slice(0, 2));
      }
      
      setFormData(prevState => {
        console.log("ExpertReport: Updating formData with Excel data");
        return { ...prevState, excelData: data.data };
      });
      
      setStatusMessage(`Successfully imported ${data.data.length} rows of data!`);
    } catch (error) {
      console.error('ExpertReport: Error parsing Excel file:', error);
      setStatusMessage(`Error parsing Excel file: ${error.message}`);
      
      // Show popup alert with error message
      alert(`Error parsing Excel file: ${error.message}`);
      
      // Reset the file input
      if (excelInputRef.current) {
        excelInputRef.current.value = "";
      }
    }
  };

  // Parse Excel file
  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          console.log("ExpertReport: Excel sheet names:", workbook.SheetNames);
          
          const worksheet = workbook.Sheets[firstSheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet);
          console.log("ExpertReport: Raw Excel parsing complete, rows:", parsedData.length);
          
          // Validate the required columns
          const requiredColumns = ['Sr No', 'Full Name', 'User Action', 'TimeStamp'];
          let columnsPresent = [];
          
          if (parsedData.length > 0) {
            columnsPresent = Object.keys(parsedData[0]);
            
            // Check if all required columns are present (case-insensitive comparison)
            const missingColumns = requiredColumns.filter(col => 
              !columnsPresent.some(presentCol => 
                presentCol.toLowerCase() === col.toLowerCase()
              )
            );
            
            if (missingColumns.length > 0) {
              console.error("ExpertReport: Missing required columns:", missingColumns);
              // Return data with validation info
              resolve({
                validFormat: false,
                data: [],
                columns: columnsPresent,
                missingColumns: missingColumns
              });
              return;
            }
          } else {
            // No data in the sheet
            console.error("ExpertReport: No data found in the Excel sheet");
            resolve({
              validFormat: false,
              data: [],
              columns: [],
              missingColumns: requiredColumns
            });
            return;
          }
          
          // Format is valid
          resolve({
            validFormat: true,
            data: parsedData,
            columns: columnsPresent
          });
        } catch (error) {
          console.error("ExpertReport: Excel parsing error:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("ExpertReport: FileReader error:", error);
        reject(error);
      }
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle feedback data Excel file upload
  const handleFeedbackUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setProcessingFeedback(true);
      setStatusMessage('Processing feedback data...');
      
      // Use the utility function from feedbackAnalysis.js
      const processedData = await processExcelData(file);
      
      // Prepare data for charts
      const preparedChartData = prepareChartData(processedData);
      setChartData(preparedChartData);
      
      // Update form data with feedback data
      setFormData({
        ...formData,
        feedbackData: processedData
      });
      
      setStatusMessage(`Successfully imported feedback data! Charts are generated and ready to capture.`);
    } catch (error) {
      console.error('Error processing feedback data:', error);
      setStatusMessage(`Error processing feedback data: ${error.message}`);
    } finally {
      setProcessingFeedback(false);
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
        
        // Store locally instead of uploading to Cloudinary
        setFormData(prevState => ({
          ...prevState,
          chartImages: chartImagesArray
        }));
        
        // Update local state with chart images
        setChartImages(chartImagesArray);
        
        setStatusMessage(`✅ Successfully captured ${chartImagesArray.length} charts! These will be included in your PDF report.`);
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
    if (!chartsContainerRef.current) {
      setStatusMessage('Chart container not found.');
      return;
    }

    if (chartData.length === 0) {
      setStatusMessage('No chart data available. Please upload feedback data first.');
      return;
    }

    try {
      setProcessingFeedback(true);
      setStatusMessage('Capturing feedback charts...');
      
      // Find all chart canvases
      const chartElements = chartsContainerRef.current.querySelectorAll('.chart-container');
      const capturedImages = [];
      
      for (let i = 0; i < chartElements.length; i++) {
        const chartElement = chartElements[i];
        const chartTitle = chartElement.getAttribute('data-title') || `Chart ${i+1}`;
        
        // Use html2canvas to capture each chart
        const canvas = await html2canvas(chartElement, { 
          backgroundColor: '#ffffff',
          scale: 2  // Higher quality
        });
        
        // Convert to base64 image data
        const imageData = canvas.toDataURL('image/png');
        capturedImages.push({
          src: imageData,
          title: chartTitle
        });
      }
      
      setChartImages(capturedImages);
      
      // Update form data with captured charts
      setFormData(prevFormData => ({
        ...prevFormData,
        chartImages: capturedImages
      }));
      
      setStatusMessage(`Successfully captured ${capturedImages.length} feedback charts! These will be included in the PDF report.`);
    } catch (error) {
      console.error('Error capturing charts:', error);
      setStatusMessage(`Error capturing charts: ${error.message}`);
    } finally {
      setProcessingFeedback(false);
    }
  };

  // Upload images to Cloudinary
  const uploadToCloudinary = async (file, preset = 'report_expert') => {
    const formDataForUpload = new FormData();
    formDataForUpload.append('file', file);
    formDataForUpload.append('upload_preset', preset);
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/darnokazg/image/upload`,
        formDataForUpload
      );
      
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index, category = 'general') => {
    // Update the imageFiles state
    setImageFiles(prevFiles => {
      const updatedFiles = { ...prevFiles };
      
      // Remove the specific image from the category
      if (updatedFiles[category] && updatedFiles[category].length > index) {
        updatedFiles[category] = updatedFiles[category].filter((_, i) => i !== index);
      }
      
      return updatedFiles;
    });
    
    // Also update the formData
    setFormData(prevData => {
      if (!prevData.categorizedImages || !prevData.categorizedImages[category]) {
        return prevData;
      }
      
      const updatedCategorizedImages = { ...prevData.categorizedImages };
      updatedCategorizedImages[category] = updatedCategorizedImages[category].filter((_, i) => i !== index);
      
      return {
        ...prevData,
        categorizedImages: updatedCategorizedImages
      };
    });
  };

  // Add a function to handle categorized image uploads
  const handleCategorizedImageUpload = (uploadedImages, category) => {
    // Default to 'general' if no category is provided
    const categoryMapping = {
      'event': 'team',
      'feedback': 'speakers', // Now used for question set images (previously speakers)
      'document': 'certificates'  // Map 'document' to 'certificates' for approval letters & documents
    };

    // Map the UI category to internal category name or default to the category provided
    const imageCategory = categoryMapping[category] || category || 'general';
    
    console.log(`Received ${uploadedImages.length} uploaded images in category: ${category}, mapped to: ${imageCategory}`);
    console.log('Image data sample:', uploadedImages[0]); // Log first image data for debugging
    
    // Update the imageFiles state with the new uploads - ensure we only add to specific category
    setImageFiles(prevFiles => {
      // Create a deep copy of the current state to avoid reference issues
      const updatedFiles = { ...prevFiles };
      
      // Initialize category array if it doesn't exist
      if (!updatedFiles[imageCategory]) {
        updatedFiles[imageCategory] = [];
      }
      
      // Add new images to the appropriate category
      updatedFiles[imageCategory] = [
        ...updatedFiles[imageCategory], 
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
        speakers: [],
        certificates: [],
        general: []
      };
      
      // Initialize category array if it doesn't exist
      if (!existingCategorizedImages[imageCategory]) {
        existingCategorizedImages[imageCategory] = [];
      }
      
      // Extract the original URL from each uploaded image object
      const imageUrls = uploadedImages.map(img => img.original);
      console.log(`Extracted ${imageUrls.length} image URLs for category ${imageCategory}`);
      
      // Add the new image URLs to the appropriate category
      const updatedCategorizedImages = {
        ...existingCategorizedImages,
        [imageCategory]: [
          ...existingCategorizedImages[imageCategory],
          ...imageUrls  // Store just the URL strings
        ]
      };
      
      console.log(`Updated formData: ${imageCategory} category now has ${updatedCategorizedImages[imageCategory].length} image URLs`);
      
      return {
        ...prevData,
        categorizedImages: updatedCategorizedImages
      };
    });
    
    setStatusMessage(`Successfully added ${uploadedImages.length} images to the ${category} category!`);
  };

  // Generate PDF using ExpertReportPDFContainer
  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    setPdfError(null);
    
    try {
      // If chart data exists but no chart images, capture charts first
      if (chartData.length > 0 && (!formData.chartImages || formData.chartImages.length === 0)) {
        setStatusMessage('Capturing charts before generating PDF...');
        await captureCharts();
      }
      
      // Log the form data being passed to the PDF component
      console.log("ExpertReport: Generating PDF with form data:", {
        title: formData.title,
        eventDate: formData.eventDate,
        excelDataLength: formData.excelData?.length || 0,
        chartImagesLength: formData.chartImages?.length || 0,
        excelData: formData.excelData?.slice(0, 2) // Log first 2 rows for debugging
      });
      
      // Create PDF document
      const pdfDoc = <ExpertReportPDFContainer data={formData} chartImages={formData.chartImages} />;
      const asPdf = pdf();
      asPdf.updateContainer(pdfDoc);
      const blob = await asPdf.toBlob();
      
      // Download PDF
      const fileName = `Expert_Session_${formData.title.replace(/\s+/g, "_")}.pdf`;
      saveAs(blob, fileName);
      
      setGeneratingPDF(false);
      setStatusMessage('PDF generated and downloaded successfully!');
      
      // Keep the success message visible for 5 seconds
      setTimeout(() => {
        if (statusMessage === 'PDF generated and downloaded successfully!') {
          setStatusMessage('');
        }
      }, 5000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfError(error.message || "Failed to generate PDF");
      setStatusMessage(`Error generating PDF: ${error.message}`);
      setGeneratingPDF(false);
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
          new Paragraph(new TextRun({ text: `Event Date: ${formData.eventDate || 'N/A'}`, bold: true })),
          new Paragraph({ text: formData.title || 'N/A', heading: "Heading1" }),
          new Paragraph(`Event Time: ${formData.eventTime || 'N/A'}`),
          new Paragraph(`Organized By: ${formData.organizer || 'N/A'}`),
          new Paragraph(`Course Name: ${formData.courseName || 'N/A'}`),
          new Paragraph(`Mode of Conduction: ${formData.mode || 'N/A'}`),
          new Paragraph(`Link: ${formData.link || 'N/A'}`),
          new Paragraph(`Number of Participants: ${formData.participants || 'N/A'}`),
          new Paragraph(`Resource Person: ${formData.resourcePerson || 'N/A'}`),
          new Paragraph("")
        ]
      };
      
      // Add Objectives
      commonSection.children.push(
        new Paragraph({ text: "Objectives:", heading: "Heading2" })
      );
      
      if (formData.objectives && formData.objectives.length > 0) {
        formData.objectives.forEach((obj, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${obj}`));
        });
      }
      
      // Add Outcomes
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "Outcomes:", heading: "Heading2" })
      );
      
      if (formData.outcomes && formData.outcomes.length > 0) {
        formData.outcomes.forEach((outcome, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${outcome}`));
        });
      }
      
      // Add CO/PO Mapping
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "CO/PO/PSOs Addressed:", heading: "Heading2" })
      );
      
      if (formData.coPoMapping && formData.coPoMapping.length > 0) {
        formData.coPoMapping.forEach((mapping, index) => {
          commonSection.children.push(new Paragraph(`${index + 1}. ${mapping.code}: ${mapping.description}`));
        });
      }
      
      // Add Impact Analysis
      commonSection.children.push(
        new Paragraph(""),
        new Paragraph({ text: "Impact Analysis:", heading: "Heading2" })
      );
      
      if (formData.impactAnalysis && formData.impactAnalysis.length > 0) {
        formData.impactAnalysis.forEach((impact, index) => {
          commonSection.children.push(
            new Paragraph(`${index + 1}. ${impact.title}`),
            new Paragraph(`   ${impact.content}`)
          );
        });
      }
      
      // Add Feedback Analysis section if available
      if (formData.feedbackData && formData.feedbackData.length > 0) {
        commonSection.children.push(
          new Paragraph(""),
          new Paragraph({ text: "Feedback Analysis:", heading: "Heading2" }),
          new Paragraph(`Feedback data collected from ${formData.feedbackData.length} respondents.`)
        );
      }
      
      sections.push(commonSection);
      
      const doc = new Document({
        sections: sections,
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Expert_Session_${formData.title.replace(/\s+/g, "_")}.docx`);
      
      setIsGeneratingWord(false);
      setStatusMessage('Word document generated and downloaded successfully!');
      
      // Keep the success message visible for 5 seconds
      setTimeout(() => {
        if (statusMessage === 'Word document generated and downloaded successfully!') {
          setStatusMessage('');
        }
      }, 5000);
    } catch (error) {
      console.error("Error generating Word document:", error);
      setWordError(error.message || "Failed to generate Word document");
      setStatusMessage(`Error generating Word document: ${error.message}`);
      setIsGeneratingWord(false);
    }
  };

  // Save report to database
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setStatusMessage('Saving your report...');
      
      // Check if charts need to be captured
      if (chartData.length > 0 && (!formData.chartImages || formData.chartImages.length === 0)) {
        console.log("Charts not captured yet, attempting to capture before saving");
        setStatusMessage("Capturing charts before saving report...");
        await captureCharts();
      }
      
      // Create a clean report data object
      let reportDataToSave = { ...formData };
      
      // Optimize chart images to reduce payload size
      if (reportDataToSave.chartImages && reportDataToSave.chartImages.length > 0) {
        console.log(`Optimizing ${reportDataToSave.chartImages.length} chart images before save`);
        
        // Limit the number of chart images (keep only the first 10)
        if (reportDataToSave.chartImages.length > 10) {
          console.log(`Limiting chart images from ${reportDataToSave.chartImages.length} to 10`);
          reportDataToSave.chartImages = reportDataToSave.chartImages.slice(0, 10);
        }
        
        // Resize base64 images to reduce payload size
        reportDataToSave.chartImages = reportDataToSave.chartImages.map(img => {
          // If the image is already a URL (not base64), keep it as is
          if (typeof img.src === 'string' && !img.src.startsWith('data:')) {
            return img;
          }
          
          // Keep metadata but compress the image
          return {
            ...img,
            // Set a quality parameter to reduce size (note: we keep the src as is to avoid corrupting the data)
            title: img.title // Keep the title to identify the chart
          };
        });
      }
      
      // Create a deep copy of the categorized images
      const categorizedImagesCopy = JSON.parse(JSON.stringify(reportDataToSave.categorizedImages || {}));
      
      // Flatten all image URLs for backward compatibility
      const allImageUrls = [
        ...(categorizedImagesCopy.team || []),
        ...(categorizedImagesCopy.speakers || []),
        ...(categorizedImagesCopy.certificates || [])
      ];
      
      // Add type and update fields
      reportDataToSave = {
        ...reportDataToSave,
        images: allImageUrls,
        reportType: 'expert',
        createdAt: new Date().toISOString()
      };
      
      // Remove any circular references or complex objects
      delete reportDataToSave.imageFiles;
      
      // Ensure excelData is properly structured
      if (reportDataToSave.excelData && Array.isArray(reportDataToSave.excelData)) {
        console.log(`Preparing Excel data with ${reportDataToSave.excelData.length} rows`);
        
        // Limit number of excel rows if needed
        if (reportDataToSave.excelData.length > 500) {
          console.log(`Limiting Excel data from ${reportDataToSave.excelData.length} to 500 rows`);
          reportDataToSave.excelData = reportDataToSave.excelData.slice(0, 500);
        }
      }
      
      // Log the data size to identify potential issues
      const dataSizeKB = JSON.stringify(reportDataToSave).length / 1024;
      console.log(`Report data size: ${dataSizeKB.toFixed(2)} KB`);
      
      // Show warning if payload is large
      if (dataSizeKB > 5000) {
        console.warn(`Report data is very large (${dataSizeKB.toFixed(2)} KB). This may cause issues.`);
        setStatusMessage(`Saving large report (${dataSizeKB.toFixed(2)} KB). This may take a while...`);
      }
      
      console.log("Sending Expert Session report to server with:", {
        type: reportDataToSave.reportType,
        title: reportDataToSave.title,
        chartImagesCount: reportDataToSave.chartImages?.length || 0,
        imagesCount: reportDataToSave.images?.length || 0,
        excelDataRows: reportDataToSave.excelData?.length || 0
      });
      
      // Use our API service to send the data
      const response = await apiService.createReport(reportDataToSave);

      console.log("Expert Session Report Created:", response);

      // Show success message
      setSaveSuccess(true);
      setStatusMessage('Expert Session Report saved successfully! You can continue editing or generate a PDF.');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
      
      // Remove navigation logic to stay on the same page
      console.log("Report saved - staying on the current page");
      
    } catch (error) {
      console.error("Error creating Expert Session report:", error);
      let errorMessage = "Failed to save Expert Session report.";
      
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });

        // Handle specific error codes
        if (error.response.status === 401) {
          errorMessage = "Authentication error: Your session has expired. Please log in again.";
          // Token handling is managed by axios interceptor
        } 
        else if (error.response.status === 413) {
          errorMessage = "Error: Report data is too large. Try reducing the number of images or charts.";
        }
        else if (error.response.status === 400) {
          errorMessage = `Validation error: ${error.response.data.message || 'Please check your form data.'}`;
          if (error.response.data.errors) {
            const fieldErrors = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            errorMessage += ` Fields with errors: ${fieldErrors}`;
          }
        }
        else if (error.response.status >= 500) {
          errorMessage = "Server error: The server encountered an error processing your request. Please try again later or contact support.";
          
          if (error.response.data && error.response.data.details) {
            console.error("Server error details:", error.response.data.details);
          }
        }
        else {
        errorMessage += ` Server responded with: ${error.response.status} - ${error.response.data.message || error.response.statusText}`;
        }
      } else if (error.request) {
        console.error('Request error (no response):', error.request);
        errorMessage += " No response received from server. Please check your connection.";
      } else {
        console.error('Request setup error:', error.message);
        errorMessage += ` Error: ${error.message}`;
      }
      
      setStatusMessage(errorMessage);
    } finally {
      setSaving(false);
      // Remove any navigation-related code from the finally block
    }
  };

  // Reset form
  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to reset the form? All entered data will be lost.")) {
      // Reset all state variables
      setImageFiles({
        team: [],
        speakers: [],
        certificates: []
      });
      setChartData([]);
      setChartImages([]);
      setStatusMessage("");
      setSaveSuccess(false);
      setPdfError(null);
      setWordError(null);
      setGeneratingPDF(false);
      setIsGeneratingWord(false);
      setProcessingFeedback(false);
      
      // Reset file input refs
      if (feedbackInputRef.current) feedbackInputRef.current.value = '';
      if (excelInputRef.current) excelInputRef.current.value = '';
      
      // Reset form data with initial state including extraSections
      setFormData({
        title: "",
        eventDate: "",
        eventTime: "",
        organizer: [""],
        courseName: "",
        mode: "",
        link: "",
        participants: "235",
        objectives: [""],
        outcomes: [""],
        coPoMapping: [
          { code: "C19412C.6", description: "Students will be able to apply information retrieval techniques and learned how Quantum Computing helps in boosting speed of different IR algorithms" },
          { code: "PO11", description: "Project Management and Finance (To manage projects in multidisciplinary environment)" },
          { code: "PSO3", description: "Work in team to manage complex IT project using suitable project management techniques by utilizing high level interpersonal skills" }
        ],
        resourcePerson: [""],
        impactAnalysis: [
          { title: "Knowledge Enhancement", content: "The session deepened the students' understanding of quantum computing fundamentals (e.g., qubits, superposition, entanglement). They gained insight into practical applications like cryptography, optimization, or quantum algorithms." },
          { title: "Awareness", content: "The session raised awareness about the current state of quantum computing research, challenges, and industry trends." },
          { title: "Skill Development", content: "Improved problem-solving or basic programming skills in quantum programming languages like Qiskit or Cirq." },
          { title: "Career Influence", content: "Students expressed an interest in pursuing careers or research in quantum computing as a result of the session." },
          { title: "Student Feedback", content: "Feedback form has been shared among students to understand their enthusiasm and satisfaction with the session." }
        ],
        excelData: [],
        feedbackData: [],
        chartImages: [],
        keyFeedbackPoints: [],
        performanceMetrics: [],
        feedbackCount: 0,
        averageRating: 0,
        netPromoterScore: 0,
        categorizedImages: {
          team: [],
          speakers: [],
          certificates: []
        },
        extraSections: [] // Initialize empty array for extra sections
      });
    }
  };

  const renderDetailsTab = () => {
    return (
      <>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Event Details</h3>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          {/* Title */}
          <div>
              <label className="block font-bold text-gray-800 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the title of the expert session (e.g., Quantum Computing Workshop)"
              required
            />
          </div>
          
          {/* Event Date */}
          <div>
              <label className="block font-bold text-gray-800 mb-2">Event Date</label>
            <input
              type="date"
              value={formData.eventDate ? formData.eventDate.split('/').reverse().join('-') : ''}
              onChange={(e) => {
                if (!e.target.value) {
                  setFormData({ ...formData, eventDate: '' });
                  return;
                }
                // Convert YYYY-MM-DD to DD/MM/YYYY format
                const date = new Date(e.target.value);
                const formattedDate = date.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).split('/').join('/');
                setFormData({ ...formData, eventDate: formattedDate });
              }}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Event Time */}
          <div>
              <label className="block font-bold text-gray-800 mb-2">Event Time</label>
              <div className="flex items-center space-x-2">
            <input
                  type="time"
                  value={formData.eventTime.split(" to ")[0]?.replace(/\s*(am|pm)/i, "") || ""}
                  onChange={(e) => {
                    const startTime = e.target.value;
                    const endTime = formData.eventTime.split(" to ")[1] || "";
                    setFormData({ 
                      ...formData, 
                      eventTime: startTime ? `${startTime}${endTime ? " to " + endTime : ""}` : "" 
                    });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={formData.eventTime.split(" to ")[1]?.replace(/\s*(am|pm)/i, "") || ""}
                  onChange={(e) => {
                    const startTime = formData.eventTime.split(" to ")[0] || "";
                    const endTime = e.target.value;
                    setFormData({ 
                      ...formData, 
                      eventTime: `${startTime}${endTime ? " to " + endTime : ""}` 
                    });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
              </div>
          </div>
          
          {/* Organized By */}
          <div>
              <label className="block font-bold text-gray-800 mb-2">Organized By</label>
            <div className="space-y-2">
              {formData.organizer.map((org, index) => (
                <div key={`organizer-${index}`} className="flex gap-2">
            <input
              type="text"
                    value={org}
                    onChange={(e) => handleArrayChange('organizer', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organizer's name (e.g., Ms. Arti G Ghule)"
              required
            />
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem('organizer', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddArrayItem('organizer')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
              >
                <span className='mr-1'>+</span> Add Organizer
              </button>
            </div>
          </div>
          
          {/* Course Name */}
          <div>
              <label className="block font-bold text-gray-800 mb-2">Course Name</label>
            <input
              type="text"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course name (e.g., Natural Language Processing)"
              required
            />
          </div>
          
          {/* Mode of Conduction */}
          <div>
              <label className="block font-bold text-gray-800 mb-2">Mode of Conduction</label>
            <select
              value={formData.mode}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  mode: e.target.value,
                  // Clear the link if mode is changed to Offline
                  link: e.target.value === 'Offline' ? '' : formData.link
                });
              }}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select mode of conduction</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
          
          {/* Link (if Online) */}
          <div className="col-span-1 md:col-span-2">
              <label className="block font-bold text-gray-800 mb-2">Link (if Online)</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter meeting link for online sessions"
              disabled={formData.mode === 'Offline'}
            />
          </div>
          
          {/* Participants */}
          <div>
              <label className="block font-bold text-gray-800 mb-2">Number of Students Participated</label>
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter number of students participated"
              required
            />
          </div>
          
          {/* Resource Person */}
          <div>
            <label className="block font-bold text-gray-800 mb-2">Resource Person</label>
            <div className="space-y-2">
              {formData.resourcePerson.map((person, index) => (
                <div key={`resource-person-${index}`} className="flex gap-2">
            <input
              type="text"
                    value={person}
                    onChange={(e) => handleArrayChange('resourcePerson', index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter resource person's name"
              required
            />
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem('resourcePerson', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddArrayItem('resourcePerson')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
              >
                <span className='mr-1'>+</span> Add Resource Person
              </button>
            </div>
          </div>
          </div>
        </div>
        
        {/* Objectives & Outcomes Section */}
        <div className="mb-8">
          <h3 className="block font-bold text-gray-800 mb-2">Objectives & Outcomes</h3>
        
        {/* Objectives */}
          <div className="mb-5">
            <label className="block font-bold text-gray-800 mb-2">Objectives</label>
          {formData.objectives.map((objective, index) => (
            <div key={`objective-${index}`} className="flex mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={index === 0 ? "Enter objective (e.g., Providing knowledge of the topic with real-life examples)" : `Enter objective ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('objectives', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('objectives')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className="mr-1">+</span> Add Objective
          </button>
        </div>
        
        {/* Outcomes */}
          <div className="mb-5">
            <label className="block font-bold text-gray-800 mb-2">Outcomes</label>
          {formData.outcomes.map((outcome, index) => (
            <div key={`outcome-${index}`} className="flex mb-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleArrayChange('outcomes', index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={index === 0 ? "Enter outcome (e.g., Understanding the role and applications in different sectors)" : `Enter outcome ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('outcomes', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('outcomes')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className="mr-1">+</span> Add Outcome
          </button>
          </div>
        </div>
        
        {/* CO/PO/PSO Mapping Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">CO/PO/PSOs Addressed</h3>
          
          {formData.coPoMapping.map((mapping, index) => (
            <div key={`mapping-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div className="md:col-span-1">
                <input
                  type="text"
                  value={mapping.code}
                  onChange={(e) => handleNestedObjectChange('coPoMapping', index, 'code', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="CO/PO/PSO Code"
                />
              </div>
              <div className="md:col-span-3 flex">
                <input
                  type="text"
                  value={mapping.description}
                  onChange={(e) => handleNestedObjectChange('coPoMapping', index, 'description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('coPoMapping', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('coPoMapping')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className="mr-1">+</span> Add CO/PO/PSO Mapping
          </button>
        </div>
        
        {/* Add Extra Sections before the Impact Analysis Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Additional Sections</h3>
          <p className="text-gray-600 mb-3">
            Add any additional sections that you want to include in the report.
          </p>
          
          {formData.extraSections.map((section, index) => (
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
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
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
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
        
        {/* Impact Analysis Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Impact Analysis</h3>
          
          {formData.impactAnalysis.map((impact, index) => (
            <div key={`impact-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div className="md:col-span-1">
                <input
                  type="text"
                  value={impact.title}
                  onChange={(e) => handleNestedObjectChange('impactAnalysis', index, 'title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Title"
                />
              </div>
              <div className="md:col-span-3 flex">
                <input
                  type="text"
                  value={impact.content}
                  onChange={(e) => handleNestedObjectChange('impactAnalysis', index, 'content', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Content"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('impactAnalysis', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('impactAnalysis')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
          >
            <span className="mr-1">+</span> Add Impact
          </button>
        </div>

        {/* Excel Upload Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Attendance & Performance Data</h3>
          <p className="text-gray-600 mb-2 text-sm">
            Upload an Excel file containing student attendance and performance data.
          </p>
          
          <div className="bg-blue-50 p-3 rounded-md mb-3 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-blue-800 mb-1">Required Excel Format:</p>
            <p className="text-sm text-blue-700">
              The file must include these <span className="font-bold">exact column headers</span>:
            </p>
            <div className="flex flex-wrap gap-2 mt-1 mb-2">
              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">Sr No</span>
              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">Full Name</span>
              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">User Action</span>
              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">TimeStamp</span>
            </div>
            <p className="text-xs text-blue-600">
              <FaInfoCircle className="inline mr-1" /> Files without these exact columns will be rejected.
            </p>
            
            <div className="mt-3 flex">
            <button
              type="button"
                onClick={() => excelInputRef.current.click()}
                className="flex items-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
            >
                <FaFileExcel className="mr-2" /> Upload Excel Data
            </button>
              
                    <button
                      type="button"
                onClick={() => {
                  const template = [
                    {
                      'Sr No': '1',
                      'Full Name': 'Student Name',
                      'User Action': 'Joined',
                      'TimeStamp': '2024-03-20 10:00:00'
                    }
                  ];
                  const ws = XLSX.utils.json_to_sheet(template);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Template");
                  XLSX.writeFile(wb, "expert_report_template.xlsx");
                }}
                className="ml-2 flex items-center p-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
              >
                <FaFileExcel className="mr-2" /> Download Template
                    </button>
                  </div>
        </div>

          {/* Hidden file input */}
            <input
              type="file"
            ref={excelInputRef}
            onChange={handleExcelUpload}
              className="hidden"
            accept=".xlsx,.xls"
          />
          
          {formData.excelData && formData.excelData.length > 0 && (
            <div className="mt-2">
              <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded mb-2">
                <span className="font-medium">✓ {formData.excelData.length} student records loaded</span>
                  </div>
              
              {/* Show preview of first 5 records */}
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Data Preview (First 5 entries):</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                    <thead className="bg-gray-100">
                      <tr>
                        {formData.excelData[0] && Object.keys(formData.excelData[0]).map((header, idx) => (
                          <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.excelData.slice(0, 5).map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.values(row).map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-3 py-2 text-xs text-gray-500 truncate max-w-xs">
                              {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {formData.excelData.length > 5 && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {formData.excelData.length - 5} more records.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Data Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Feedback Data Analysis</h3>
          <p className="text-gray-600 mb-3 text-sm">
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
              className="mb-4 flex items-center p-3 border-2 border-dashed border-green-300 rounded-md text-green-500 hover:text-green-700 hover:border-green-500 transition duration-200"
              disabled={processingFeedback}
            >
              {processingFeedback ? (
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
                XLSX.writeFile(wb, "expert_session_feedback_template.xlsx");
              }}
              className="mb-4 flex items-center p-3 border-2 border-dashed border-green-300 rounded-md text-green-500 hover:text-green-700 hover:border-green-500"
            >
              <FaFileExcel className="mr-2" /> Download Template
            </button>
          </div>
          </div>

        {/* Feedback Charts Display */}
        {chartData.length > 0 && (
          <div className="mb-8" id="feedback-charts-container">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Feedback Charts</h3>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Charts generated from feedback data will appear below.</p>
                <button
                  type="button"
                onClick={handleManualCaptureCharts}
                className={`px-3 py-1 ${
                  chartData.length > 0 && (!chartImages || chartImages.length === 0)
                    ? "bg-green-500 text-white font-medium text-sm rounded hover:bg-green-600 animate-pulse"
                    : "bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                } flex items-center transition duration-200`}
              >
                {chartData.length > 0 && (!chartImages || chartImages.length === 0) ? (
                  <>Capture Charts (Required)</>
                ) : (
                  <>{chartImages && chartImages.length > 0 ? `${chartImages.length} Charts Captured` : 'Recapture Charts'}</>
                )}
                </button>
              </div>

            <div ref={chartsContainerRef} id="chart-container" className="p-4 border border-gray-300 rounded-md bg-white">
              <FeedbackCharts chartsData={chartData} />
              
              {/* Success message for captured charts */}
              {chartImages && chartImages.length > 0 && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Successfully captured {chartImages.length} charts!</span>
              </div>
                  <p className="text-sm mt-1 ml-7">These will be included in your PDF report.</p>
            </div>
          )}
        </div>
          </div>
        )}

        {/* Image Upload Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Event Images & Documents</h3>
          
          {/* Image category tabs */}
        <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Upload Images by Category</h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload images for each category separately. These will be used in different sections of the PDF report.
            </p>
            
            <div className="space-y-6">
              {/* Event Photographs */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-2 text-blue-800">Photographs of Event</h5>
                <p className="text-sm text-gray-600 mb-3">Upload images of the event, participants, and attendees.</p>
                <CloudinaryUploader 
                  onUploadSuccess={(images) => handleCategorizedImageUpload(images, 'event')}
                  onUploadError={(error) => {
                    console.error("Cloudinary upload failed:", error);
                    setStatusMessage(`Event image upload failed: ${error.message}`);
                  }}
                  buttonText="Upload Photographs of Event"
                  folder="expert_images"
                  maxFiles={5}
                  category="event"
                  className="mb-2"
                />
                
                {/* Event Images Preview */}
                {imageFiles.team && imageFiles.team.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imageFiles.team.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.thumbnail || file.preview || file.original} 
                            alt={`Event ${index + 1}`}
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
                    
                    {/* Success message for event images */}
                    <div className="mt-3 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Successfully uploaded {imageFiles.team.length} event photographs!</span>
                      </div>
                      <p className="text-sm mt-1 ml-7">These will be included in your PDF report.</p>
              </div>
            </div>
          )}
        </div>

              {/* Question set for Feedback - previously Speaker & Resource Person Photos */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-2 text-green-800">Question set for Feedback</h5>
                <p className="text-sm text-gray-600 mb-3">Upload images of question sets used for feedback collection.</p>
                <CloudinaryUploader 
                  onUploadSuccess={(images) => handleCategorizedImageUpload(images, 'feedback')}
                  onUploadError={(error) => {
                    console.error("Cloudinary upload failed:", error);
                    setStatusMessage(`Question set upload failed: ${error.message}`);
                  }}
                  buttonText="Upload Question set for Feedback"
                  folder="expert_images"
                  maxFiles={5}
                  category="feedback"
                  className="mb-2"
                />
                
                {/* Question Set Images Preview */}
                {imageFiles.speakers && imageFiles.speakers.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imageFiles.speakers.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.thumbnail || file.preview || file.original} 
                            alt={`Question set ${index + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-200"
                          />
            <button
              type="button"
                            onClick={() => handleRemoveImage(index, 'speakers')}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
            >
                            <FaTrash size={12} />
            </button>
          </div>
                      ))}
                    </div>
                    
                    {/* Success message for question set images */}
                    <div className="mt-3 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Successfully uploaded {imageFiles.speakers.length} question set images!</span>
                      </div>
                      <p className="text-sm mt-1 ml-7">These will be included in your PDF report.</p>
              </div>
            </div>
          )}
        </div>

              {/* Approval Letters & Documents */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-2 text-purple-800">Expert Session Notice/Approval Letter:</h5>
                <p className="text-sm text-gray-600 mb-3">Upload approval letters, official documents, and permissions related to the event.</p>
                <CloudinaryUploader 
                  onUploadSuccess={(images) => handleCategorizedImageUpload(images, 'document')}
                  onUploadError={(error) => {
                    console.error("Cloudinary upload failed:", error);
                    setStatusMessage(`Document upload failed: ${error.message}`);
                  }}
                  buttonText="Upload Expert Session Notice/Approval Letter"
                  folder="expert_images"
                  maxFiles={5}
                  category="document"
                  className="mb-2"
                />
                
                {/* Documents Preview */}
                {imageFiles.certificates && imageFiles.certificates.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imageFiles.certificates.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.thumbnail || file.preview || file.original} 
                            alt={`Document ${index + 1}`}
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
                    
                    {/* Success message for document images */}
                    <div className="mt-3 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Successfully uploaded {imageFiles.certificates.length} document images!</span>
                    </div>
                      <p className="text-sm mt-1 ml-7">These will be included in your PDF report.</p>
                  </div>
                </div>
                )}
            </div>
          </div>
          </div>
        </div>
      </>
    );
  };

    return (
    <div className="max-w-6xl mx-auto p-8">
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }} className="bg-white p-8 rounded-lg shadow-lg transform transition duration-500 hover:scale-102">
        <div className="flex flex-col mb-6">
          {/* Title without back button */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Expert Session Report</h2>
          <p className="text-sm text-gray-600">Fill in the details to generate a report for an expert session event</p>
        </div>
        
        {saveSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded">
            <div className="flex items-center">
              <FaCheckCircle className="mr-2" />
              <span>Report saved successfully!</span>
            </div>
            </div>
        )}
        
        {statusMessage && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mb-4 rounded">
            <p>{statusMessage}</p>
            </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg mb-6">
          {renderDetailsTab()}
            </div>
          
        {/* Submit Button Section */}
        <div className="flex justify-between mt-6">
            <div>
            <button 
              type="button" 
              onClick={handleResetForm}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              Reset Form
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 flex items-center ${
                generatingPDF ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {generatingPDF ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <><FaFilePdf className="mr-2" /> Download PDF</>
              )}
            </button>
            
            {/* <button
              type="button"
              onClick={generateWordReport}
              disabled={isGeneratingWord}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center ${
                isGeneratingWord ? 'opacity-70 cursor-not-allowed' : ''
              }`}
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
              disabled={saving}
              className={`bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition duration-300 flex items-center ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <><FaSave className="mr-2" /> Save Report</>
              )}
            </button>
          </div>
        </div>
        
        {/* Success message at the bottom of the form - similar to PDA and Teaching reports */}
        {saveSuccess && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Expert Session Report saved successfully!</span>
          </div>
            <p className="text-sm mt-1 ml-7">Your report has been saved. You can view it in the Previous Reports section or continue editing.</p>
        </div>
        )}
        
        {/* New success message for PDF generation */}
        {statusMessage && statusMessage.includes('PDF generated and downloaded successfully') && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">PDF generated and downloaded successfully!</span>
          </div>
            <p className="text-sm mt-1 ml-7">Your PDF report has been generated. You can continue editing or view the downloaded file.</p>
        </div>
        )}
        
        {/* New success message for Word document generation */}
        {statusMessage && statusMessage.includes('Word document generated and downloaded successfully') && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Word document generated and downloaded successfully!</span>
            </div>
            <p className="text-sm mt-1 ml-7">Your Word document has been generated. You can continue editing or view the downloaded file.</p>
          </div>
        )}
      </form>
    </div>
  );
};

// Simplified component for debugging
const ExpertReportSimple = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('');
  
  console.log("Rendering simple ExpertReport component");

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg transform transition duration-500 hover:scale-102">
        <div className="flex flex-col mb-6">
          {/* Title without back button */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Expert Session Report</h2>
          <p className="text-sm text-gray-600">Simplified version for debugging purposes</p>
        </div>

      {statusMessage && (
          <div className="mb-4 p-4 rounded bg-blue-100 border border-blue-400 text-blue-700">
            <p>{statusMessage}</p>
        </div>
      )}

        <div className="bg-white rounded-lg mb-6">
          <p className="text-lg">This is a simplified version of the Expert Report component for debugging purposes.</p>
        <button
            onClick={() => setStatusMessage("Test message displayed successfully")}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Test Display
        </button>
      </div>
      </div>
    </div>
  );
};

const ExpertReport = () => {
  console.log("Rendering full ExpertReport component");
  return <ExpertReportFull />;
};

// Properly wrap the component with ErrorBoundary
const ExpertReportWithErrorBoundary = () => (
  <ErrorBoundary>
    <ExpertReport />
  </ErrorBoundary>
);

export default ExpertReportWithErrorBoundary;
