// Utility functions for processing feedback Excel data
import * as XLSX from 'xlsx';

// Function to read Excel file and extract data
export const processExcelData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process the data to find questions and answers
        const processedData = processQuestionData(jsonData);
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

// Function to identify questions and count responses
export const processQuestionData = (jsonData) => {
  // Get all columns from the first row
  if (jsonData.length === 0) return [];
  
  const firstRow = jsonData[0];
  const columns = Object.keys(firstRow);
  
  // Find columns that are questions (containing a "?")
  const questionColumns = columns.filter(column => column.includes('?'));
  
  // Process each question
  const questions = questionColumns.map(column => {
    // Get all responses for this question
    const responses = jsonData.map(row => row[column]);
    
    // Count occurrences of each response
    const responseCounts = {};
    responses.forEach(response => {
      if (response) {
        responseCounts[response] = (responseCounts[response] || 0) + 1;
      }
    });
    
    return {
      question: column,
      responses: responseCounts
    };
  });
  
  return questions;
};

// Function to prepare data for Charts.js
export const prepareChartData = (questionData) => {
  return questionData.map(data => {
    const labels = Object.keys(data.responses);
    const counts = Object.values(data.responses);
    
    // Colors for the charts (can be customized)
    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(40, 159, 64, 0.6)',
      'rgba(210, 199, 199, 0.6)',
    ];
    
    // Ensure we have enough colors
    while (backgroundColors.length < labels.length) {
      backgroundColors.push(...backgroundColors);
    }
    
    return {
      question: data.question,
      chartData: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderWidth: 1
          }
        ]
      }
    };
  });
}; 