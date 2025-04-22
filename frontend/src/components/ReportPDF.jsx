import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  section: {
    marginBottom: 1,
    padding: 10,
    // borderBottom: "1px solid #000"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10
  },
  table: {
    display: "table",
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10
  },
  tableRow: {
    flexDirection: "row"
  },
  tableCellHeader: {
    flex: 1,
    padding: 5,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    fontWeight: "bold",
    backgroundColor: "#E4E4E4",
    textAlign: "center"
  },
  tableCell: {
    fontSize : 12,
    fontWeight : "bold",
    textAlign : "left",
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  col1:{
    width: "20%",
    padding: 5,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    textAlign: "center"
  },
  col2:{
    width:"80%",
    // padding: 5,
    paddingBottom : 0,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    textAlign: "center"
  },
  col3:{
    width: "5%",
    padding: 5,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    textAlign: "center"
  },
  col4:{
    width:"95%",
    // padding: 5,
    paddingRight : 5,
    paddingLeft : 3,
    paddingTop:7,
    paddingBottom : 7,
    // paddingBottom : 0,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    textAlign: "center"
  },
  t1: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 5,   // Add some spacing around the text
    paddingHorizontal: 10 // Add horizontal padding for better alignment
  },
  t2: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,        // Reduces extra spacing on top
    marginBottom: 5,     // Adds balanced spacing at the bottom
    paddingHorizontal: 10, // Aligns the text with consistent padding
  },
  t3: {
    fontSize: 12,
    textAlign: "left",
    marginTop: 5,        // Reduces extra spacing on top
    marginBottom: 5,     // Adds balanced spacing at the bottom
    paddingHorizontal: 50, // Aligns the text with consistent padding
    padding : 10,
  },
  t4: {
    fontSize: 12,
    textAlign: "left",
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 50,
    padding : 10,
    fontWeight: "bold",
  },
  boldText: {
    fontWeight: "bold"
  },
  italicText: {
    fontStyle: "italic"
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    alignSelf: "center"
  },
  img: {
    width: 400,
    height: 400,
    // marginVertical: 10,
    alignSelf: "center"
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    width: '100%',  
    marginVertical: 10 // Adds spacing before/after the line
  },
  chartImage: {
    width: 500,
    height: 400,
    objectFit: 'contain',
    marginVertical: 20,
    alignSelf: "center"
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 15
  },
  feedbackSection: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15
  },
  individualChartContainer: {
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center'
  },
  barChartImage: {
    width: 600,
    height: 350,
    objectFit: 'contain',
    marginVertical: 10,
    alignSelf: "center"
  },
  pieChartImage: {
    width: 600,
    height: 350,
    objectFit: 'contain',
    marginVertical: 10,
    alignSelf: "center"
  },
  combinedChartImage: {
    width: 600,
    height: 'auto',
    maxHeight: 280,
    objectFit: 'contain',
    marginVertical: 2,
    alignSelf: "center"
  },
  questionContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 7
  },
  questionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc"
  },
  responseSummary: {
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    marginTop: 2
  },
  activityTable: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 10
  },
  activityTableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderStyle: 'solid',
    textAlign: 'center'
  },
  activityTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderStyle: 'solid'
  },
  activityTableCell: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderStyle: 'solid',
    fontSize: 10
  },
  activityTableLastCell: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
    fontSize: 10
  },
  logoImage: {
    width: 106,
    height: 110,
    alignSelf: 'center',
    marginBottom: 5
  },
  staticImage: {
    width: '100%',
    maxWidth: 400,
    height: 'auto',
    maxHeight: 270,
    objectFit: 'contain',
    alignSelf: 'center',
    marginBottom: 5
  },
  // Add styles for statistics display
  statsContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  statCardTitle: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gradeDistribution: {
    marginTop: 15,
    width: '100%',
  },
  gradeRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  gradeLabel: {
    width: 150,
    fontSize: 12,
  },
  gradeBar: {
    height: 15,
    backgroundColor: '#4a90e2',
    borderRadius: 2,
  },
  gradeValue: {
    marginLeft: 10,
    fontSize: 12,
    width: 80,
    textAlign: 'right',
  },
  passFailContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  passFailStat: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
  },
  passRate: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  failRate: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
});

// Define constants
const MAX_ITEMS_ON_FIRST_PAGE = 3; // Maximum number of extra sections to display on the first page

// Try/catch wrapper for safe text display
const SafeText = ({ style, children }) => {
  try {
    return <Text style={style}>{children}</Text>;
  } catch (error) {
    console.error("Error rendering text:", error);
    return <Text style={style}>Error displaying content</Text>;
  }
};

// Safe image component to handle errors
const SafeImage = ({ style, src }) => {
  try {
    return <Image style={style} src={src} />;
  } catch (error) {
    console.error("Error rendering image:", error);
    return (
      <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Image could not be displayed</Text>
      </View>
    );
  }
};

// Utility function to format performance data safely
const formatPerformanceData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      totalStudents: 0,
      avgMark: 'N/A',
      maxMark: 'N/A',
      minMark: 'N/A',
      excellent: 0,
      good: 0,
      average: 0,
      needsImprovement: 0
    };
  }
  
  const totalStudents = data.length;
  const marks = data.map(item => Number(item['Marks'] || 0));
  const validMarks = marks.filter(m => !isNaN(m));
  
  // Calculate statistics
  const avgMark = validMarks.length > 0 
    ? (validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(2)
    : 'N/A';
    
  const maxMark = validMarks.length > 0 ? Math.max(...validMarks) : 'N/A';
  const minMark = validMarks.length > 0 ? Math.min(...validMarks) : 'N/A';
  
  // Count performance categories
  const excellent = data.filter(item => 
    item['Performance'] === 'Excellent' || 
    (item['Marks'] && Number(item['Marks']) >= 80)
  ).length;
  
  const good = data.filter(item => 
    item['Performance'] === 'Good' || 
    (item['Marks'] && Number(item['Marks']) >= 60 && Number(item['Marks']) < 80)
  ).length;
  
  const average = data.filter(item => 
    item['Performance'] === 'Average' || 
    (item['Marks'] && Number(item['Marks']) >= 40 && Number(item['Marks']) < 60)
  ).length;
  
  const needsImprovement = data.filter(item => 
    item['Performance'] === 'Needs Improvement' || 
    (item['Marks'] && Number(item['Marks']) < 40)
  ).length;
  
  return {
    totalStudents,
    avgMark,
    maxMark, 
    minMark,
    excellent,
    good,
    average,
    needsImprovement
  };
};

// Main PDF Document Component
const ReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Title Section */}
      <View style={styles.section}>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            {/* Placeholder for logo - in production, you would use a real image path */}
            <Image style={styles.logoImage} src="/pict_logo.png" />
          </Text>
          <View style={styles.col2}>
            <Text style={styles.t2}>
              PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
            </Text>

            <View style={styles.line} />

            <Text style={styles.t1}>
              Department of Information Technology {'\n'}
              S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Academic Year: {data.academicYear || '2023-2024'}                                                                                     Sem-{data.semester || '2'} </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Subject Name: {data.subjectName || 'N/A'}                                      Date: {data.date || 'N/A'} {'\n'}
              Faculty Name: {data.facultyName || 'N/A'} {'\n'}
              No of Student Attended: {data.participationData?.totalStudents || 0} 
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col3}><Text style={styles.t3}>1</Text>
            </Text>
            <Text style={styles.col4}>
              <Text style={styles.t4}>
                Title of the Innovative Teaching Learning Practice: {'\n'}
              </Text>
              <Text style={styles.t3}>_____________________________________________________________________________{'\n'}</Text>
              <Text style={styles.t3}>{data.title || 'N/A'}</Text>
              <Text style={styles.t3}>_____________________________________________________________________________{'\n'}</Text>
              <Text style={styles.t3}>                                                                            </Text>
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col3}><Text style={styles.t3}>2</Text>
            </Text>
            <Text style={styles.col4}>
              <Text style={styles.t4}>
                Objectives: {'\n'}
              </Text>
              {data.objectives && data.objectives.length > 0 ? (
                data.objectives.map((objective, index) => (
                  <Text key={index} style={styles.t3}>
                    {index + 1}. {objective}{'\n'}
                  </Text>
                ))
              ) : (
                <Text style={styles.t3}>No objectives provided.{'\n'}</Text>
              )}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col3}><Text style={styles.t3}>3</Text>
            </Text>
            <Text style={styles.col4}>
              <Text style={styles.t4}>
                Description of Activity: {'\n'}
              </Text>
              <Text style={styles.t3}>{data.description || 'No description provided.'}</Text>
            </Text>
          </View>
        </View>
      </View>
    </Page>

    <Page size="A4" style={styles.page}>
      {/* Title Section repeated for second page */}
      <View style={styles.section}>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            {/* Placeholder for logo */}
            <Image style={styles.logoImage} src="/pict_logo.png" /> 
          </Text>
          <View style={styles.col2}>
            <Text style={styles.t2}>
              PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
            </Text>

            <View style={styles.line} />

            <Text style={styles.t1}>
              Department of Information Technology {'\n'}
              S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tableRow}>
          <Text style={styles.col3}><Text style={styles.t3}>4</Text>
          </Text>
          <Text style={styles.col4}>
            <Text style={styles.t4}>
              Learning Outcomes: {'\n'}
            </Text>
            {data.learningOutcomes && data.learningOutcomes.length > 0 ? (
              data.learningOutcomes.map((outcome, index) => (
                <Text key={index} style={styles.t3}>
                  {index + 1}. {outcome}{'\n'}
                </Text>
              ))
            ) : (
              <Text style={styles.t3}>No learning outcomes provided.{'\n'}</Text>
            )}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.col3}><Text style={styles.t3}>5</Text>
          </Text>
          <Text style={styles.col4}>
            <Text style={styles.t4}>
              Target Students: tick appropriate {'\n'}
            </Text>
            <Text style={styles.t3}>
              F.E. [{data.targetYear === 'F.E.' ? ' * ' : '   '}]     
              S.E. [{data.targetYear === 'S.E.' ? ' * ' : '   '}]    
              T.E. [{data.targetYear === 'T.E.' ? ' * ' : '   '}]   
              B.E. [{data.targetYear === 'B.E.' ? ' * ' : '   '}]
            </Text>
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.col3}><Text style={styles.t3}>6</Text>
          </Text>
          <Text style={styles.col4}>
            <Text style={styles.t4}>
              Snapshot: About event conduction/live session {'\n'}
            </Text>
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col3}><Text style={styles.t3}></Text>
          </Text>
            <View style={styles.col4}>
              {data.images && data.images.length > 0 ? (
                <SafeImage src={data.images[0]} style={styles.staticImage} />
              ) : (
                <SafeImage src="/snap1.png" style={styles.staticImage} />
              )}
            </View>
        </View>
      </View>
    </Page>

    {/* Add dynamic pages for images if available, or default images if none */}
    {(data.images && data.images.length > 1) ? (
      (() => {
        // Calculate how many image pages we need (max 4 images per page after the first image)
        const imagesPerPage = 2;
        const remainingImages = data.images.slice(1);
        const numPages = Math.ceil(remainingImages.length / imagesPerPage);
        
        // Create array of pages
        const pages = [];
        
        for (let i = 0; i < numPages; i++) {
          const startIdx = i * imagesPerPage;
          const endIdx = Math.min(startIdx + imagesPerPage, remainingImages.length);
          const pageImages = remainingImages.slice(startIdx, endIdx);
          
          pages.push(
            <Page key={`image-page-${i}`} size="A4" style={styles.page}>
              {/* Title Section repeated for image pages */}
              <View style={styles.section}>
                <View style={styles.tableRow}>
                  <Text style={styles.col1}>
                    <Image style={styles.logoImage} src="/pict_logo.png" />
                  </Text>
                  <View style={styles.col2}>
                    <Text style={styles.t2}>
                      PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.t1}>
                      Department of Information Technology {'\n'}
                      S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.tableRow}>
                  <Text style={styles.col3}><Text style={styles.t3}></Text></Text>
                  <View style={styles.col4}>
                    {/* Render images for this page */}
                    {pageImages.map((imageUrl, idx) => (
                      <View key={`img-${startIdx + idx}`} style={{ marginBottom: 10 }}>
                        <SafeImage src={imageUrl} style={styles.staticImage} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Page>
          );
        }
        
        return pages;
      })()
    ) : (
      // Default static images page when no user images are uploaded
      <Page size="A4" style={styles.page}>
        {/* Title Section repeated for image pages */}
        <View style={styles.section}>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>
              <Image style={styles.logoImage} src="/pict_logo.png" />
            </Text>
            <View style={styles.col2}>
              <Text style={styles.t2}>
                PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
              </Text>
              <View style={styles.line} />
              <Text style={styles.t1}>
                Department of Information Technology {'\n'}
                S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableRow}>
            <Text style={styles.col3}><Text style={styles.t3}></Text></Text>
            <View style={styles.col4}>
              {/* Render default static images */}
              <View style={{ marginBottom: 10 }}>
                <SafeImage src="/snap2.png" style={styles.staticImage} />
              </View>
              <View style={{ marginBottom: 10 }}>
                <SafeImage src="/snap3.png" style={styles.staticImage} />
              </View>
            </View>
          </View>
        </View>
      </Page>
    )}

{/* First Page Content */}
{data.extraSections && data.extraSections.length > 0 && <Page size="A4" style={styles.page}>
  <View style={styles.section}>
    {/* Title Section */}
    <View style={styles.tableRow}>
      <Text style={styles.col1}>
        <Image style={styles.logoImage} src="/pict_logo.png" />
      </Text>
      <View style={styles.col2}>
        <Text style={styles.t2}>
          PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
        </Text>
        <View style={styles.line} />
        <Text style={styles.t1}>
          Department of Information Technology {'\n'}
          S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
        </Text>
      </View>
    </View>

    {/* Extra Sections (Start adding on first page if possible) */}
    {data.extraSections.slice(0, MAX_ITEMS_ON_FIRST_PAGE).map((section, index) => (
      <View key={index} style={styles.tableRow}>
        <Text style={styles.col3}><Text style={styles.t3}>{index + 7}</Text></Text>
        <Text style={styles.col4}>
          <Text style={styles.t3}>
            {section.title || 'Untitled Section'}: {'\n'}
          </Text>
          <Text style={styles.t3}>
            {section.description || 'No description provided.'}
          </Text>
        </Text>
      </View>
    ))}
  </View>
</Page>

  }

{/* New Page for Overflowing Extra Sections */}
{data.extraSections && data.extraSections.length > 0 && data.extraSections.slice(MAX_ITEMS_ON_FIRST_PAGE).map((section, index) => (
  <Page key={`extra-${index}`} size="A4" style={styles.page}>
    <View style={styles.section}>
      <View style={styles.tableRow}>
        <Text style={styles.col3}><Text style={styles.t3}>{MAX_ITEMS_ON_FIRST_PAGE + index + 7}</Text></Text>
        <Text style={styles.col4}>
          <Text style={styles.t3}>
            {section.title || 'Untitled Section'}: {'\n'}
          </Text>
          <Text style={styles.t3}>
            {section.description || 'No description provided.'}
          </Text>
        </Text>
      </View>
    </View>
  </Page>
))}
    {/* Add page for Roll No wise Activity Analysis */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            <Image style={styles.logoImage} src="/pict_logo.png" />
          </Text>
          <View style={styles.col2}>
            <Text style={styles.t2}>
              PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
            </Text>
            <View style={styles.line} />
            <Text style={styles.t1}>
              Department of Information Technology {'\n'}
              S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tableRow}>
          <Text style={styles.col3}><SafeText style={styles.t3}>{7 + (data.extraSections ? data.extraSections.length : 0)}</SafeText></Text>
          <View style={styles.col4}>
            <SafeText style={styles.t4}>
              Roll No wise Activity Analysis: {'\n'}
            </SafeText>
            
            <SafeText style={{...styles.t3, fontWeight: 'bold', textAlign: 'center', fontSize: 14}}>
              Roll No wise Activity Analysis report: -
            </SafeText>

            {/* Add the participation summary table */}
            <View style={styles.activityTable}>
              <View style={styles.activityTableRow}>
                <Text style={{...styles.activityTableCell, fontSize: 12, padding: 10, fontWeight: 'bold'}}>
                  Total No of Students in Class
                </Text>
                <Text style={{...styles.activityTableCell, fontSize: 12, padding: 10, fontWeight: 'bold'}}>
                  Learning Material was Provided to No of students
                </Text>
                <Text style={{...styles.activityTableLastCell, fontSize: 12, padding: 10, fontWeight: 'bold'}}>
                  No of students participated in activity
                </Text>
              </View>
              <View style={styles.activityTableRow}>
                <Text style={{...styles.activityTableCell, fontSize: 16, padding: 10}}>
                  {data.participationData?.totalStudents || 0}
                </Text>
                <Text style={{...styles.activityTableCell, fontSize: 16, padding: 10}}>
                  {data.participationData?.materialProvidedTo || data.participationData?.totalStudents || 0}
                </Text>
                <Text style={{...styles.activityTableLastCell, fontSize: 16, padding: 10}}>
                  {data.participationData?.studentsParticipated || 0}
                </Text>
              </View>
              <View style={styles.activityTableRow}>
                <Text style={{...styles.activityTableCell, fontSize: 12, padding: 10, fontWeight: 'bold', flex: 2}}>
                  Total Percentage of students participated in activity
                </Text>
                <Text style={{...styles.activityTableLastCell, fontSize: 16, padding: 10}}>
                  {data.participationData?.participationPercentage || 
                    ((data.participationData?.studentsParticipated / data.participationData?.totalStudents * 100) || 0).toFixed(2)} %
                </Text>
              </View>
            </View>

            {/* Student-wise details table */}
            <Text style={{...styles.t3, marginTop: 15, fontWeight: 'bold'}}>
              Student-wise Performance Details:
            </Text>
            
            <View style={styles.activityTable}>
              {/* Table Header */}
              <View style={styles.activityTableRow}>
                <Text style={styles.activityTableCell}>Sr. No</Text>
                <Text style={styles.activityTableCell}>Roll No</Text>
                <Text style={styles.activityTableCell}>Name</Text>
                <Text style={styles.activityTableCell}>Marks</Text>
                <Text style={styles.activityTableLastCell}>Performance</Text>
              </View>
              
              {/* Table Content - Use data.excelData if available, otherwise use placeholder data */}
              {data.excelData && data.excelData.length > 0 ? (
                data.excelData.map((item, index) => (
                  <View key={index} style={styles.activityTableRow}>
                    <Text style={styles.activityTableCell}>{item['Sr No'] || index + 1}</Text>
                    <Text style={styles.activityTableCell}>{item['Roll Number'] || '-'}</Text>
                    <Text style={styles.activityTableCell}>{item['Name'] || '-'}</Text>
                    <Text style={styles.activityTableCell}>{item['Marks'] || '-'}</Text>
                    <Text style={styles.activityTableLastCell}>
                      {item['Performance'] || (
                        item['Marks'] >= 80 ? 'Excellent' : 
                        item['Marks'] >= 60 ? 'Good' : 
                        item['Marks'] >= 40 ? 'Average' : 'Needs Improvement'
                      )}
                    </Text>
                  </View>
                ))
              ) : (
                // Show a message if no excel data is provided
                <View style={styles.activityTableRow}>
                  <View style={{...styles.activityTableCell, flex: 5, textAlign: 'center', padding: 10}}>
                    <Text>No student performance data available. Please upload an Excel file with student data.</Text>
                  </View>
                </View>
              )}
            </View>
            
            {/* Add Performance Analysis Summary */}
            {data.excelData && data.excelData.length > 0 && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>
                  Performance Analysis Summary
                </Text>
                
                {/* Main stats cards in a 2x2 grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>Total Students</Text>
                    <Text style={styles.statCardValue}>{data.excelData.length}</Text>
                  </View>
                  
                  <View style={[styles.statCard, { borderColor: '#4a90e2' }]}>
                    <Text style={styles.statCardTitle}>Average Mark</Text>
                    <Text style={styles.statCardValue}>
                      {(() => {
                        const marks = data.excelData.map(item => Number(item['Marks'] || 0));
                        const validMarks = marks.filter(m => !isNaN(m));
                        return validMarks.length > 0 
                          ? (validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(2) 
                          : 'N/A';
                      })()}
                    </Text>
                  </View>
                  
                  <View style={[styles.statCard, { borderColor: '#4caf50' }]}>
                    <Text style={styles.statCardTitle}>Highest Mark</Text>
                    <Text style={styles.statCardValue}>
                      {(() => {
                        const marks = data.excelData.map(item => Number(item['Marks'] || 0));
                        const validMarks = marks.filter(m => !isNaN(m));
                        return validMarks.length > 0 ? Math.max(...validMarks) : 'N/A';
                      })()}
                    </Text>
                  </View>
                  
                  <View style={[styles.statCard, { borderColor: '#f44336' }]}>
                    <Text style={styles.statCardTitle}>Lowest Mark</Text>
                    <Text style={styles.statCardValue}>
                      {(() => {
                        const marks = data.excelData.map(item => Number(item['Marks'] || 0));
                        const validMarks = marks.filter(m => !isNaN(m) && m > 0);
                        return validMarks.length > 0 ? Math.min(...validMarks) : 'N/A';
                      })()}
                    </Text>
                  </View>
                </View>
                
                {/* Grade Distribution */}
                <View style={styles.gradeDistribution}>
                  <Text style={[styles.statCardTitle, { marginBottom: 10, textAlign: 'center' }]}>
                    Grade Distribution
                  </Text>
                  
                  {(() => {
                    const gradeRanges = [
                      { min: 80, max: 100, label: 'Excellent (80-100)', color: '#4caf50' },
                      { min: 60, max: 79, label: 'Good (60-79)', color: '#8bc34a' },
                      { min: 40, max: 59, label: 'Average (40-59)', color: '#ffeb3b' },
                      { min: 0, max: 39, label: 'Needs Improvement (0-39)', color: '#f44336' }
                    ];
                    
                    const totalStudents = data.excelData.length;
                    
                    return gradeRanges.map((grade, index) => {
                      const studentsInGrade = data.excelData.filter(
                        student => {
                          const mark = Number(student['Marks'] || 0);
                          return mark >= grade.min && mark <= grade.max;
                        }
                      ).length;
                      
                      const percentage = totalStudents > 0 ? (studentsInGrade / totalStudents) * 100 : 0;
                      
                      return (
                        <View style={styles.gradeRow} key={index}>
                          <Text style={styles.gradeLabel}>{grade.label}</Text>
                          <View style={[styles.gradeBar, { width: `${Math.max(percentage, 0.5)}%`, backgroundColor: grade.color }]} />
                          <Text style={styles.gradeValue}>{studentsInGrade} ({percentage.toFixed(1)}%)</Text>
                        </View>
                      );
                    });
                  })()}
                </View>
                
                {/* Pass/Fail Rate */}
                <View style={styles.passFailContainer}>
                  {(() => {
                    const totalStudents = data.excelData.length;
                    const passingMark = 40; // Assuming 40 is passing mark
                    
                    const passedStudents = data.excelData.filter(
                      student => Number(student['Marks'] || 0) >= passingMark
                    ).length;
                    
                    const passPercentage = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0.0';
                    const failPercentage = totalStudents > 0 ? (100 - parseFloat(passPercentage)).toFixed(1) : '0.0';
                    
                    return (
                      <>
                        <View style={[styles.passFailStat, styles.passRate]}>
                          <Text style={styles.statCardTitle}>Pass Rate</Text>
                          <Text style={[styles.statCardValue, { color: '#2e7d32' }]}>{passPercentage}%</Text>
                          <Text style={{ fontSize: 11, color: '#2e7d32' }}>{passedStudents} students</Text>
                        </View>
                        
                        <View style={[styles.passFailStat, styles.failRate]}>
                          <Text style={styles.statCardTitle}>Fail Rate</Text>
                          <Text style={[styles.statCardValue, { color: '#c62828' }]}>{failPercentage}%</Text>
                          <Text style={{ fontSize: 11, color: '#c62828' }}>{totalStudents - passedStudents} students</Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Page>

    {/* Add pages for feedback analysis charts - two questions per page */}
    {data.chartImages && data.chartImages.length > 0 && (
      <>
        {/* Introduction page for feedback analysis */}
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>
                <Image style={styles.logoImage} src="/pict_logo.png" />
              </Text>
              <View style={styles.col2}>
                <Text style={styles.t2}>
                  PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
                </Text>
                <View style={styles.line} />
                <Text style={styles.t1}>
                  Department of Information Technology {'\n'}
                  S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.tableRow}>
              <Text style={styles.col3}><SafeText style={styles.t3}>{8 + (data.extraSections ? data.extraSections.length : 0)}</SafeText></Text>
              <View style={styles.col4}>
                <SafeText style={styles.t4}>
                  Feedback Analysis: {'\n'}
                </SafeText>
                
                <SafeText style={styles.chartTitle}>
                  Student Feedback Analysis Charts
                </SafeText>
                
                <SafeText style={styles.t3}>
                  The following pages contain charts visualizing student feedback for each question.
                  {data.feedbackData ? ` ${data.feedbackData.length} questions were analyzed.` : ''}
                </SafeText>
                
                {/* Add textual representation of feedback data summary */}
                {data.feedbackData && data.feedbackData.length > 0 && (
                  <View style={{marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#ccc'}}>
                    <SafeText style={{fontSize: 12, fontWeight: 'bold', marginBottom: 10}}>
                      Feedback Data Summary:
                    </SafeText>
                    {data.feedbackData.map((item, index) => (
                      <View key={index} style={{marginBottom: 10, textAlign: 'left'}}>
                        <SafeText style={{fontSize: 10, fontWeight: 'bold', textAlign: 'left'}}>
                          Question {index+1}: {item.question}
                        </SafeText>
                        {Object.entries(item.responses).map(([response, count], respIndex) => (
                          <SafeText key={respIndex} style={{fontSize: 10, textAlign: 'left'}}>
                            • {response}: {count} responses
                          </SafeText>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Page>
        
        {/* Create a map of questions and their charts */}
        {(() => {
          // Handle old format (single image)
          if (typeof data.chartImages[0] === 'string') {
            return (
              <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                  <View style={styles.tableRow}>
                    <Text style={styles.col1}>
                      <Image style={styles.logoImage} src="/pict_logo.png" />
                    </Text>
                    <View style={styles.col2}>
                      <Text style={styles.t2}>
                        PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
                      </Text>
                      <View style={styles.line} />
                      <Text style={styles.t1}>
                        Department of Information Technology
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.section}>
                  <SafeText style={styles.chartTitle}>
                    Student Feedback Analysis Chart
                  </SafeText>
                  <View style={{width: '100%', height: 450, marginVertical: 15, backgroundColor: '#f5f5f5', padding: 10}}>
                    <SafeImage 
                      src={data.chartImages[0]} 
                      style={styles.chartImage}
                    />
                  </View>
                </View>
              </Page>
            );
          }
          
          // Create a map of questions and their charts
          const questionMap = {};
          data.chartImages.forEach(chart => {
            if (typeof chart === 'string') {
              return;
            }
            
            const questionIndex = chart.questionIndex;
            if (!questionMap[questionIndex]) {
              questionMap[questionIndex] = [];
            }
            questionMap[questionIndex].push(chart);
          });
          
          // Get all question indices and sort them numerically
          const questionIndices = Object.keys(questionMap).sort((a, b) => parseInt(a) - parseInt(b));
          
          // Create pages with two questions per page
          const pages = [];
          for (let i = 0; i < questionIndices.length; i += 2) {
            // Get current and next question index
            const currentQuestionIndex = questionIndices[i];
            const nextQuestionIndex = i + 1 < questionIndices.length ? questionIndices[i + 1] : null;
            
            // Create a page with up to two questions
            pages.push(
              <Page key={`page-${i}`} size="A4" style={styles.page}>
                <View style={styles.section}>
                  <View style={styles.tableRow}>
                    <Text style={styles.col1}>
                      <Image style={styles.logoImage} src="/pict_logo.png" />
                    </Text>
                    <View style={styles.col2}>
                      <Text style={styles.t2}>
                        PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
                      </Text>
                      <View style={styles.line} />
                      <Text style={styles.t1}>
                        Department of Information Technology
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.section}>
                  {/* First Question */}
                  <View style={styles.questionContainer}>
                    {/* Question header */}
                    <View style={{marginBottom: 5}}>
                      <SafeText style={styles.questionHeader}>
                        {data.feedbackData && data.feedbackData[currentQuestionIndex] ? 
                          data.feedbackData[currentQuestionIndex].question : 
                          (questionMap[currentQuestionIndex][0]?.title || `Question ${parseInt(currentQuestionIndex) + 1}`)}
                      </SafeText>
                    </View>
                    
                    {/* Chart for first question */}
                    <View style={{marginTop: 7, marginBottom: 7, alignItems: 'center'}}>
                      <SafeImage 
                        src={questionMap[currentQuestionIndex][0].src} 
                        style={styles.combinedChartImage}
                      />
                    </View>
                    
                    {/* Response summary for first question */}
                    {data.feedbackData && data.feedbackData[currentQuestionIndex] && (
                      <View style={styles.responseSummary}>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                          {Object.entries(data.feedbackData[currentQuestionIndex].responses).map(([response, count], respIndex) => (
                            <View key={respIndex} style={{flexDirection: 'row', marginRight: 20, marginBottom: 5, width: '45%'}}>
                              <SafeText style={{fontSize: 8, fontWeight: 'bold'}}>• {response}: </SafeText>
                              <SafeText style={{fontSize: 8}}>{count} responses</SafeText>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  
                  {/* Second Question (if available) */}
                  {nextQuestionIndex && (
                    <View style={styles.questionContainer}>
                      {/* Question header */}
                      <View style={{marginBottom: 5}}>
                        <SafeText style={styles.questionHeader}>
                          {data.feedbackData && data.feedbackData[nextQuestionIndex] ? 
                            data.feedbackData[nextQuestionIndex].question : 
                            (questionMap[nextQuestionIndex][0]?.title || `Question ${parseInt(nextQuestionIndex) + 1}`)}
                        </SafeText>
                      </View>
                      
                      {/* Chart for second question */}
                      <View style={{marginTop: 7, marginBottom: 7, alignItems: 'center'}}>
                        <SafeImage 
                          src={questionMap[nextQuestionIndex][0].src} 
                          style={styles.combinedChartImage}
                        />
                      </View>
                      
                      {/* Response summary for second question */}
                      {data.feedbackData && data.feedbackData[nextQuestionIndex] && (
                        <View style={styles.responseSummary}>
                          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {Object.entries(data.feedbackData[nextQuestionIndex].responses).map(([response, count], respIndex) => (
                              <View key={respIndex} style={{flexDirection: 'row', marginRight: 20, marginBottom: 5, width: '45%'}}>
                                <SafeText style={{fontSize: 8, fontWeight: 'bold'}}>• {response}: </SafeText>
                                <SafeText style={{fontSize: 8}}>{count} responses</SafeText>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </Page>
            );
          }
          
          return pages;
        })()}
      </>
    )}

    <Page size="A4" style={styles.page}>
      {/* Signature Page */}
      <View style={styles.section}>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            <Image style={styles.logoImage} src="/pict_logo.png" />
          </Text>
          <View style={styles.col2}>
            <Text style={styles.t2}>
              PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE - 411043{'\n'}
            </Text>

            <View style={styles.line} />

            <Text style={styles.t1}>
              Department of Information Technology {'\n'}
              S.No.-27, Pune Satara Road, Dhankawadi, Pune-411043
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.t3}>
          {data.facultyName || 'Faculty Name'}{'\n'}                                                                                    
          Course Teacher                                                                                             Dr. A. S. Ghotkar{'\n'} 
          Signature                                                                                                        HoD-IT  {'\n'}
        </Text>
      </View>
    </Page>
  </Document>
);

export default ReportPDF; 

