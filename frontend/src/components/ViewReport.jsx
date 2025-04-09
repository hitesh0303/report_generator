import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import ReportPDF from './ReportPDF';
import ReportPDAPDFContainer from './ReportPDAPDFContainer';
import ExpertReportPDFContainer from './ExpertReportPDFContainer';

const ViewReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [convertingToWord, setConvertingToWord] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('Failed to load report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownload = async (format) => {
    if (!report) return;

    setDownloading(true);
    setDownloadStatus(`Preparing ${format.toUpperCase()} file...`);

    try {
      if (format === 'pdf') {
        let PDFComponent;
        switch (report.reportType) {
          case 'pda':
            PDFComponent = <ReportPDAPDFContainer data={report} />;
            break;
          case 'expert':
            PDFComponent = <ExpertReportPDFContainer data={report} />;
            break;
          default:
            PDFComponent = <ReportPDF data={report} />;
        }

        const blob = await pdf(PDFComponent).toBlob();
        saveAs(blob, `${report.title.replace(/\s+/g, "_")}_Report.pdf`);
      } else if (format === 'docx') {
        try {
          setConvertingToWord(true);
          setDownloadStatus("Generating PDF for conversion to Word...");
          
          // First generate the PDF using the React-PDF renderer
          let PDFComponent;
          switch (report.reportType) {
            case 'pda':
              PDFComponent = <ReportPDAPDFContainer data={report} />;
              break;
            case 'expert':
              PDFComponent = <ExpertReportPDFContainer data={report} />;
              break;
            default:
              PDFComponent = <ReportPDF data={report} />;
          }
          
          const pdfBlob = await pdf(PDFComponent).toBlob();
          
          // Convert the PDF blob to a File object
          const fileName = `${report.title.replace(/\s+/g, "_")}_Report.pdf`;
          const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
          
          setDownloadStatus("Sending to ILovePDF for conversion...");
          
          // Create FormData for the API request
          const formData = new FormData();
          formData.append('file', pdfFile);
          
          // Send the file to your backend for conversion
          // Note: You'll need to implement this endpoint on your backend
          const response = await axios.post('http://localhost:8000/api/convert-to-word', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob'
          });
          
          // Create a blob from the response data
          const wordBlob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          
          // Save the Word file
          saveAs(wordBlob, `${report.title.replace(/\s+/g, "_")}_Report.docx`);
          setDownloadStatus(`Word document downloaded successfully!`);
        } catch (error) {
          console.error("Error converting PDF to Word:", error);
          setDownloadStatus(`Error converting to Word: ${error.message}`);
          
          // Fallback to basic Word generation
          setDownloadStatus("Falling back to basic Word generation...");
          generateBasicWordDocument();
        } finally {
          setConvertingToWord(false);
        }
      }
    } catch (error) {
      console.error(`Error generating ${format}:`, error);
      setDownloadStatus(`Error generating ${format}. Please try again.`);
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadStatus(''), 5000);
    }
  };
  
  // Fallback method that uses the docx library for basic Word generation
  const generateBasicWordDocument = async () => {
    try {
      // Very basic Word document generation as fallback
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: "PUNE INSTITUTE OF COMPUTER TECHNOLOGY", heading: "Title" }),
            new Paragraph({ text: "Department: Information Technology", bold: true }),
            new Paragraph(new TextRun({ text: `Title: ${report.title}`, bold: true })),
            new Paragraph(`Date: ${report.date || report.eventDate || 'N/A'}`),
            new Paragraph(`Report Type: ${
              report.reportType === 'teaching' ? 'Teaching Activity' :
              report.reportType === 'pda' ? 'PDA Report' :
              'Expert Session'
            }`),
            // Add more basic content
            new Paragraph({ text: "Note: This is a simplified version. For better formatting, please use the PDF option.", italic: true })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${report.title.replace(/\s+/g, "_")}_Simple.docx`);
      setDownloadStatus(`Basic Word document downloaded. For better formatting, try the PDF option.`);
    } catch (error) {
      console.error("Error in fallback Word generation:", error);
      setDownloadStatus(`Unable to generate Word document: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link to="/dashboard" className="text-red-700 underline mt-2 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-8">
          <p className="text-gray-600">Report not found.</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 mr-4">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{report.title}</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            disabled={downloading}
          >
            <FaFilePdf className="mr-2" /> PDF
          </button>
          {/* <button
            onClick={() => handleDownload('docx')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            disabled={downloading}
          >
            <FaFileWord className="mr-2" /> Word
          </button> */}
        </div>
      </div>

      {downloadStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">{downloadStatus}</p>
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Report Type Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            report.reportType === 'teaching' ? 'bg-blue-100 text-blue-800' :
            report.reportType === 'pda' ? 'bg-purple-100 text-purple-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {report.reportType === 'teaching' ? 'Teaching Activity' :
             report.reportType === 'pda' ? 'PDA Report' :
             'Expert Session'}
          </span>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <p><span className="font-medium">Title:</span> {report.title}</p>
              <p><span className="font-medium">Date:</span> {report.date || report.eventDate}</p>
              {report.eventTime && <p><span className="font-medium">Time:</span> {report.eventTime}</p>}
              {report.subjectName && <p><span className="font-medium">Subject:</span> {report.subjectName}</p>}
              {report.courseName && <p><span className="font-medium">Course:</span> {report.courseName}</p>}
              {report.facultyName && <p><span className="font-medium">Faculty:</span> {report.facultyName}</p>}
              {report.targetYear && <p><span className="font-medium">Target Year:</span> {report.targetYear}</p>}
              {report.academicYear && <p><span className="font-medium">Academic Year:</span> {report.academicYear}</p>}
              {report.semester && <p><span className="font-medium">Semester:</span> {report.semester}</p>}
              {report.organizer && report.reportType !== 'teaching' && report.reportType !== 'pda' && (
                <p><span className="font-medium">Organizer:</span> {
                  Array.isArray(report.organizer) ? report.organizer.join(', ') : report.organizer
                }</p>
              )}
              {report.organizedBy && <p><span className="font-medium">Organized By:</span> {report.organizedBy}</p>}
              {report.institution && <p><span className="font-medium">Institution:</span> {report.institution}</p>}
              {report.mode && <p><span className="font-medium">Mode:</span> {report.mode}</p>}
              {report.venue && <p><span className="font-medium">Venue:</span> {report.venue}</p>}
              {report.fee && <p><span className="font-medium">Fee:</span> {report.fee}</p>}
              {report.link && (
                <p>
                  <span className="font-medium">Link:</span>{' '}
                  <a href={report.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {report.link}
                  </a>
                </p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Participation Details</h3>
            <div className="space-y-3">
              {report.targetAudience && report.reportType === 'pda' && (
                <p><span className="font-medium">Target Audience:</span> {report.targetAudience}</p>
              )}
              {report.time && report.reportType === 'pda' && (
                <p><span className="font-medium">Time:</span> {report.time}</p>
              )}
              {report.participants && <p><span className="font-medium">Total Participants:</span> {report.participants}</p>}
              {report.participationData && (
                <>
                  <p><span className="font-medium">Total Students:</span> {report.participationData.totalStudents}</p>
                  <p><span className="font-medium">Material Provided To:</span> {report.participationData.materialProvidedTo}</p>
                  <p><span className="font-medium">Students Participated:</span> {report.participationData.studentsParticipated}</p>
                  <p><span className="font-medium">Participation Rate:</span> {report.participationData.participationPercentage}%</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Resource Person */}
        {report.resourcePerson && report.resourcePerson.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Resource Person</h3>
            <ul className="list-disc list-inside space-y-2">
              {Array.isArray(report.resourcePerson) ? 
                report.resourcePerson.map((person, index) => (
                  <li key={index} className="text-gray-700">{person}</li>
                )) : 
                <li className="text-gray-700">{report.resourcePerson}</li>
              }
            </ul>
          </div>
        )}

        {/* Faculty and Student Members */}
        {report.faculty && report.faculty.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Faculty Members</h3>
            <ul className="list-disc list-inside space-y-2">
              {report.faculty.map((member, index) => (
                <li key={index} className="text-gray-700">
                  {typeof member === 'object' ? 
                    `${member.name}${member.role ? ` - ${member.role}` : ''}` : 
                    member
                  }
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.students && report.students.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Student Members</h3>
            <ul className="list-disc list-inside space-y-2">
              {report.students.map((student, index) => (
                <li key={index} className="text-gray-700">{student}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Objectives */}
        {report.objectives && report.objectives.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Objectives</h3>
            <ul className="list-decimal list-inside space-y-2">
              {report.objectives.map((objective, index) => (
                <li key={index} className="text-gray-700">{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Description/Execution */}
        {(report.description || report.execution) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{report.execution ? 'Execution' : 'Description'}</h3>
            <p className="text-gray-700 whitespace-pre-line">{report.execution || report.description}</p>
          </div>
        )}

        {/* Outcomes for Expert and PDA Reports */}
        {(report.reportType === 'expert' || report.reportType === 'pda') && 
         report.outcomes && report.outcomes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Outcomes</h3>
            <ul className="list-decimal list-inside space-y-2">
              {report.outcomes.map((outcome, index) => (
                <li key={index} className="text-gray-700">
                  {typeof outcome === 'string' ? outcome : outcome.content || outcome.toString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Learning Outcomes for Teaching Reports */}
        {report.reportType === 'teaching' && report.learningOutcomes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Learning Outcomes</h3>
            {Array.isArray(report.learningOutcomes) ? (
              <ul className="list-decimal list-inside space-y-2">
                {report.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="text-gray-700">
                    {typeof outcome === 'string' ? outcome : outcome.content || outcome.toString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 whitespace-pre-line">{report.learningOutcomes}</p>
            )}
          </div>
        )}

        {/* CO/PO Mapping */}
        {report.coPoMapping && report.coPoMapping.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">CO/PO/PSOs Addressed</h3>
            <div className="space-y-4">
              {report.coPoMapping.map((mapping, index) => (
                <div key={index} className="border-b pb-4">
                  <p className="font-medium">{mapping.code}</p>
                  <p className="text-gray-700 mt-1">{mapping.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Analysis */}
        {report.impactAnalysis && report.reportType !== 'teaching' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Impact Analysis</h3>
            {Array.isArray(report.impactAnalysis) ? (
              <div className="space-y-4">
                {report.impactAnalysis.map((impact, index) => (
                  <div key={index} className="border-b pb-4">
                    {typeof impact === 'object' ? (
                      <>
                        <p className="font-medium">{impact.title}</p>
                        <p className="text-gray-700 mt-1">{impact.content}</p>
                      </>
                    ) : (
                      <p className="text-gray-700">{impact}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-line">{report.impactAnalysis}</p>
            )}
          </div>
        )}

        {/* Student Performance Analysis */}
        {report.excelData && report.excelData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {report.reportType === 'expert' ? 'Participant Attendance Record' : 'Student Performance Analysis'}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                    {report.reportType === 'expert' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks/Score</th>
                        {report.reportType === 'teaching' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.excelData.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row['Sr No'] || index + 1}</td>
                      
                      {report.reportType === 'expert' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row['Full Name'] || row['Name'] || row['Student Name'] || row['Username'] || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row['User Action'] || row['Action'] || row['Status'] || row['Join/Leave'] || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row['TimeStamp'] || row['Time'] || row['Date'] || row['DateTime'] || '-'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row['Roll Number'] || row['Roll No'] || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row['Name'] || row['Full Name'] || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row['Marks'] || row['Score'] || '-'}</td>
                          {report.reportType === 'teaching' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {row['Performance'] || (
                                row['Marks'] >= 80 ? 'Excellent' : 
                                row['Marks'] >= 60 ? 'Good' : 
                                row['Marks'] >= 40 ? 'Average' : 'Needs Improvement'
                              )}
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Extra Sections */}
        {report.extraSections && report.extraSections.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            {report.extraSections.map((section, index) => (
              <div key={index} className="mb-6">
                <h4 className="text-md font-medium mb-2">{section.title}</h4>
                <p className="text-gray-700 whitespace-pre-line">{section.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Images */}
        {((report.images && report.images.length > 0) || 
          (report.categorizedImages && Object.values(report.categorizedImages).some(arr => arr.length > 0))) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Event Images</h3>
            
            {/* Team Images */}
            {report.categorizedImages?.team && report.categorizedImages.team.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">Team Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.categorizedImages.team.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Team ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Winners Images */}
            {report.categorizedImages?.winners && report.categorizedImages.winners.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">Winners Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.categorizedImages.winners.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Winner ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers/Question Set Images */}
            {report.categorizedImages?.speakers && report.categorizedImages.speakers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">
                  {report.reportType === 'expert' ? 'Question Set Images' : 'Speaker Photos'}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.categorizedImages.speakers.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`${report.reportType === 'expert' ? 'Question Set' : 'Speaker'} ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates/Documents Images */}
            {report.categorizedImages?.certificates && report.categorizedImages.certificates.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">Documents & Certificates</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.categorizedImages.certificates.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Document ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General/Legacy Images - Don't show for expert reports if we already have categorized images */}
            {report.images && report.images.length > 0 && 
             !(report.reportType === 'expert' && 
               report.categorizedImages && 
               Object.values(report.categorizedImages).some(arr => arr.length > 0)) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Event ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback Charts */}
        {report.chartImages && report.chartImages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Feedback Analysis</h3>
            <div className="space-y-6">
              {report.chartImages.map((chart, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="text-md font-medium mb-3">
                    {typeof chart === 'object' && chart.title ? chart.title : `Chart ${index + 1}`}
                  </h4>
                  <img
                    src={typeof chart === 'object' ? chart.src : chart}
                    alt={`Feedback Chart ${index + 1}`}
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Data Summary */}
        {report.feedbackData && report.feedbackData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Feedback Data Summary</h3>
            <div className="space-y-4">
              {report.feedbackData.map((item, index) => (
                <div key={index} className="border-b pb-4">
                  <p className="font-medium">Question {index + 1}: {item.question}</p>
                  <div className="mt-2 space-y-1">
                    {Object.entries(item.responses).map(([response, count], respIndex) => (
                      <p key={respIndex} className="text-gray-700">
                        • {response}: {count} responses
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReport; 