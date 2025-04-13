import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import * as XLSX from 'xlsx'; 

const styles = StyleSheet.create({
    page: { 
        padding: 20, 
        backgroundColor: '#FFFFFF',
        flexDirection: 'column'
    },
    section: { 
        marginBottom: 10, 
        padding: 10,
    },
    image: { 
        width: 180,     // Smaller size for two-column layout
        height: 150, 
        marginBottom: 10 
    },
    chartContainer: { 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
        width: '100%'
    },
    chartItem: {
        width: '95%',
        marginBottom: 15,
        alignItems: 'center',
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        backgroundColor: '#ffffff'
    },
    chartTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5
    },
    headerRow: { 
        padding: 10,
        flexDirection: 'row', 
        alignItems: 'center',
    },
    t3: { fontSize: 13, textAlign: 'left', marginBottom: 8 },
    t5: { fontSize: 13, fontWeight: 'bold', textAlign: 'left', marginBottom: 8 },
    t4: { fontSize: 13, fontWeight: 'bold', textAlign: 'left', marginLeft: 30 },
    t2: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    chartImage: { 
        width: 480, 
        height: 240, // Reduced height to fit two charts on one page
        alignSelf: 'center', 
        marginTop: 5,
        marginBottom: 10,
        objectFit: 'contain'
    },
    t1: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    t11: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    t33: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, marginTop: 5 },
    t22: { fontSize: 15, textAlign: 'center', marginBottom: 7 },
    t44: { fontSize: 13, fontWeight: 'bold', textAlign: 'left' },
    t55: { fontSize: 13, textAlign: 'left' },
    t69:{fontSize: 13, textAlign: 'left', textDecoration: 'underline', color: 'blue'},
    t66: { fontSize: 13, fontWeight: 'bold', textAlign: 'left', marginBottom: 7, marginTop: 5 },
    t77: { fontSize: 13, textAlign: 'left', marginBottom: 7, paddingLeft: 10, paddingRight: 10, lineHeight: 1.5 },
    t88: { fontSize: 12, fontWeight: 'bold', textAlign: 'left', lineHeight: 1.5 },
    t99: { fontSize: 12, textAlign: 'left', marginBottom: 7, lineHeight: 1.5, marginTop: 5 },
    header: { textAlign: 'center', fontSize: 16, marginBottom: 10, textDecoration: 'underline' },
    img2: { width: 100, height: 70 },
    //img: { width: 400, height: 300, alignSelf: 'center', marginBottom: 2 },
    boldText1: { fontWeight: 'bold', fontSize: 13 },
    list: { marginTop: 5, paddingLeft: 20, fontSize: 13 },
    line: { borderBottomWidth: 1, borderBottomColor: '#000', width: '100%', marginVertical: 10 },
    tt: { 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        marginBottom: 5, 
    },
    tt2: { 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        marginBottom: 15, 
    },
    title: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginLeft: 10,
        color: 'blue',
        marginTop: 2,
    },
    boldText: { fontWeight: 'bold' },
    normalText: { marginBottom: 5 },
    linkText: { color: 'blue', textDecoration: 'underline' },
    listItem: { marginLeft: 15, marginBottom: 2 },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row'
    },
    tableColHeader: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#E4E4E4',
        padding: 5
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5
    },
    tableCellHeader: {
        margin: 'auto',
        fontSize: 10,
        fontWeight: 'bold'
    },
    tableCell: {
        margin: 'auto',
        fontSize: 10
    },
    gridContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        padding: '0 10px'
    },
    imageContainer: {
        width: '45%',  // Changed from 50% to allow for gap
        height: 220,   // Reduced height to fit 2x2 grid
        padding: 0,
        margin: 5,
        boxSizing: 'border-box',
        backgroundColor: '#ffffff'
    },
    image1: {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    },
    borderedImageContainer: {
        width: '45%',  // Changed from 50% to allow for gap
        height: 220,   // Reduced height to fit 2x2 grid
        padding: 0,
        margin: 5,
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
        overflow: 'hidden'
    },
    borderedImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        padding: 4
    },
    imageGalleryTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    attendanceTable: {
        marginTop: 10,
        marginBottom: 15,
    },
    tableHeader: {
        backgroundColor: '#E4E4E4',
        fontWeight: 'bold',
    },
    logoImage: {
        width: 80,
        height: 75,
        alignSelf: 'center',
        marginBottom: 5
    },
    img: { width: 400, height: 300, alignSelf: 'center', marginBottom: 10 },
    // Full page document image style
    fullPageImage: {
        width: '100%',
        height: '60vh', // Using viewport height for better sizing
        objectFit: 'contain',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    fullPageImageContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '60vh',
        marginTop: 5,
        marginBottom: 15,
    },
    approvalImage: {
        width: '100%',
        maxHeight: '60vh',
        objectFit: 'contain',
    },
    debugInfo: {
        fontSize: 8,
        color: '#666',
        padding: 3,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
        marginBottom: 5,
        width: '100%',
    },
    organizerContainer: {
        marginBottom: 15,
    },
    organizerHeader: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    organizerRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 5,
    },
    organizerItem: {
        fontSize: 13,
    },
    resourcePersonSection: {
        marginTop: 15,
        marginBottom: 15,
    },
});

// SafeText component for error handling
const SafeText = ({ style, children }) => {
    try {
        return <Text style={style}>{children}</Text>;
    } catch (error) {
        console.error("Error rendering text:", error);
        return <Text style={style}>Error displaying content</Text>;
    }
};

// Safe Image component to handle image loading errors
const SafeImage = ({ src, style, fallbackSrc }) => {
    try {
        // Handle base64 image data (for charts)
        if (typeof src === 'string' && src.startsWith('data:image/')) {
            return <Image src={src} style={style} />;
        }
        
        // Handle URLs directly
        if (typeof src === 'string' && (
            src.includes('cloudinary.com') || 
            src.startsWith('http') || 
            src.startsWith('/')
        )) {
            return <Image src={src} style={style} />;
        }
        
        // Handle objects with src property
        if (src && typeof src === 'object' && src.src) {
            if (typeof src.src === 'string') {
                // Handle base64 encoded image data
                if (src.src.startsWith('data:image/')) {
                    return <Image src={src.src} style={style} />;
                }
                
                // Handle URLs
                if (src.src.includes('cloudinary.com') || 
                    src.src.startsWith('http') || 
                    src.src.startsWith('/')
                ) {
                    return <Image src={src.src} style={style} />;
                }
            }
        }
        
        // Use fallback image if explicitly provided
        if (fallbackSrc) {
            return <Image src={fallbackSrc} style={style} />;
        }
        
        // No valid image source and no fallback
        return (
            <View style={[
                styles.placeholderBox, 
                { width: style.width, height: style.height }
            ]}>
                <Text style={styles.placeholderText}>No image available</Text>
            </View>
        );
    } catch (error) {
        console.error("Error rendering image:", error);
        return (
            <View style={[
                styles.placeholderBox, 
                { width: style.width, height: style.height }
            ]}>
                <Text style={styles.placeholderText}>Error displaying image</Text>
            </View>
        );
    }
};

// ImageGallery component for rendering categorized images
const ImageGallery = ({ images = [], defaultImage = "/Picture2.jpg", style, title, maxImages = 4 }) => {
    // If no images are provided, return placeholder
    if (!images || images.length === 0) {
        return (
            <View style={styles.gridContainer}>
                {Array.from({ length: maxImages }).map((_, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <SafeImage src={defaultImage} style={styles.image1} />
                    </View>
                ))}
            </View>
        );
    }

    // Otherwise, render the actual images (limited to maxImages)
    const imagesToShow = images.slice(0, maxImages);
    
    return (
        <View>
            {title && <SafeText style={styles.imageGalleryTitle}>{title}</SafeText>}
            <View style={styles.gridContainer}>
                {imagesToShow.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <SafeImage src={image} style={styles.image1} />
                    </View>
                ))}
                
                {/* Fill with placeholders if we have fewer than maxImages */}
                {imagesToShow.length < maxImages && Array.from({ length: maxImages - imagesToShow.length }).map((_, index) => (
                    <View key={`placeholder-${index}`} style={styles.imageContainer}>
                        <SafeImage src={defaultImage} style={styles.image1} />
                    </View>
                ))}
            </View>
        </View>
    );
};

const faculty = [
    'Mr. Sachin Pande',
    'Mrs. Amruta Patil',
    'Mr. Vinit Tribhuvan'
];
  
const students = [
    'Rudraksh Khandelwal',
    'Mikhiel Benji',
    'Akshay Raut',
    'Om Patil'
]; 

export const MyDocument = ({ chartImages, data = {} }) => {
    // Remove the separate state for excelData since we need to use the props directly
    // const [excelData, setExcelData] = useState([]);
    const [dataFormat, setDataFormat] = useState('unknown'); // 'attendance' or 'performance'

    // Safe access function with fallbacks for different column names
    const getColumnValue = (row, newKey, oldKey, fallbackKeys = []) => {
        if (!row) return 'N/A';
        
        // Try the primary keys first
        if (row[newKey] !== undefined) return String(row[newKey]);
        if (row[oldKey] !== undefined) return String(row[oldKey]);
        
        // Try fallback keys if provided
        for (const key of fallbackKeys) {
            if (row[key] !== undefined) return String(row[key]);
        }
        
        // If nothing works, return N/A
        return 'N/A';
    };

    // Utility function to determine data format
    const determineDataFormat = (data) => {
        if (!data || data.length === 0) return 'unknown';
        
        const firstRow = data[0];
        // Check if data has User Action and TimeStamp columns (attendance format)
        if (firstRow['User Action'] !== undefined && firstRow['TimeStamp'] !== undefined) {
            return 'attendance';
        }
        // Check if data has Name and Marks columns (performance format)
        else if (firstRow['Name'] !== undefined && firstRow['Marks'] !== undefined) {
            return 'performance';
        }
        return 'unknown';
    };

    // Extract attendance data from props if available, otherwise fetch from file
    useEffect(() => {
        console.log("ExpertReportPDF: Excel data received from props:", data.excelData);
        
        if (data && data.excelData && data.excelData.length > 0) {
            // Log the first few rows to check structure
            console.log("ExpertReportPDF: First 3 rows of excel data:", 
                data.excelData.slice(0, 3));
                
            // Log available columns in first row
            if (data.excelData[0]) {
                console.log("ExpertReportPDF: Available columns:", 
                    Object.keys(data.excelData[0]));
            }
            
            // Set the format based on the data structure
            const format = determineDataFormat(data.excelData);
            console.log("ExpertReportPDF: Determined data format:", format);
            setDataFormat(format);
            // Remove this line as we'll use data.excelData directly
            // setExcelData(data.excelData);
        } else {
            console.log("ExpertReportPDF: No excel data in props, trying to load from static file");
            // We're not going to set excelData in the state anymore as we'll use
            // data.excelData directly in the renderAttendanceData function
        }
    }, [data]);

    // Use data from props or defaults
    const {
        title = "Quantum Computing",
        eventDate = "17/01/2025",
        eventTime = "03:00 pm to 05:00 pm",
        organizer = "Ms. Arti G Ghule",
        courseName = "Natural Language Processing",
        mode = "Online -Microsoft Teams",
        link = "https://teams.microsoft.com/l/meetupjoin/19%3ameeting_MDk5NTAzZWMtMzczNC00MWYwLTkwZmQtODhhNmZjZDA4ZTVk%40thread.v2/0?context=%7b%22Tid%22%3a%220a0aa63d-82d0-4ba1-b909d7986ece4c4c%22%2c%22Oid%22%3a%22acdcf479-e76c-436c-8eb73ff47fb72343%22%7d",
        participants = "235",
        objectives = [
            "Providing knowledge of Quantum Computing with real-life examples",
            "Introduction of Natural Quantum Computing",
            "Creating awareness of Internship, Placements, and Research Opportunities in Quantum Computing among students"
        ],
        outcomes = [
            "Understand role of quantum computing in different sectors like aerospace, healthcare, automobile, marketing etc.",
            "Understand Quantum Computing power in computations also boosted their confidence in applying Internship, Placements and Research Opportunities in Quantum Computing effectively"
        ],
        resourcePerson = "Mrs. Vaidehi Gawande/Dhande",
        impactAnalysis = [
            { title: "Knowledge Enhancement", content: "The session deepened the students' understanding of quantum computing fundamentals (e.g., qubits, superposition, entanglement). They gained insight into practical applications like cryptography, optimization, or quantum algorithms." },
            { title: "Awareness", content: "The session raised awareness about the current state of quantum computing research, challenges, and industry trends." },
            { title: "Skill Development", content: "Improved problem-solving or basic programming skills in quantum programming languages like Qiskit or Cirq." },
            { title: "Career Influence", content: "Students expressed an interest in pursuing careers or research in quantum computing as a result of the session." },
            { title: "Student Feedback", content: "Feedback form has been shared among students to understand their enthusiasm and satisfaction with the session." }
        ],
        categorizedImages = {
            team: [],
            speakers: [], // This will be treated as 'questionSet' images for backward compatibility
            certificates: [],
            general: []
        },
        coPoMapping = [
            { code: "C19412C.6", description: "Students will be able to apply information retrieval techniques and learned how Quantum Computing helps in boosting speed of different IR algorithms" },
            { code: "PO11", description: "Project Management and Finance (To manage projects in multidisciplinary environment)" },
            { code: "PSO3", description: "Work in team to manage complex IT project using suitable project management techniques by utilizing high level interpersonal skills" }
        ],
        excelData = [] // Explicitly destructure excelData from data
    } = data;

    // Process chart images if provided
    const processedChartImages = chartImages || [];
    
    // Process certificate images - ensure we handle both array and object formats
    const certificateImages = categorizedImages?.certificates || [];
    console.log("Certificate images count:", certificateImages.length);

    // Replace renderAttendancePages function with a simpler version that doesn't paginate
    const renderAttendanceData = () => {
        return (
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                    <Text style={[styles.t1, { marginBottom: 2 }]}>
                        Society for Computer Technology & Research's{'\n'}
                        <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                        <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                    </Text>
                </View> 
                <View style={styles.section}>
                    <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                    <Text style={styles.t5}>Participant Attendance Record</Text>
                    
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableRow}>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeader}>Sr No</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeader}>Full Name</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeader}>User Action</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeader}>TimeStamp</Text>
                            </View>
                        </View>
                        
                        {/* Table Data */}
                        {excelData && excelData.length > 0 ? (
                            excelData.map((row, index) => (
                                <View style={styles.tableRow} key={index}>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {row['Sr No'] || row['id'] || (index + 1)}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {getColumnValue(row, 'Full Name', 'Name', ['Student Name', 'StudentName', 'Username'])}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {getColumnValue(row, 'User Action', 'Roll Number', ['Action', 'Status', 'Join/Leave'])}
                                        </Text>
                                    </View>
                                    <View style={styles.tableCol}>
                                        <Text style={styles.tableCell}>
                                            {getColumnValue(row, 'TimeStamp', 'Marks', ['Time', 'Date', 'DateTime'])}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCol, { width: '100%' }]}>
                                    <Text style={[styles.tableCell, { textAlign: 'center', color: '#666' }]}>
                                        No attendance data available. Please upload Excel data with the correct format.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        );
    };

    return (
        <Document>
            {/* Cover Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                    <Text style={[styles.t1, { marginBottom: 2 }]}>
                        Society for Computer Technology & Research's{'\n'}
                        <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                        <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                    </Text>
                </View> 
                <View style={styles.section}>
                    <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                    <Text style={styles.t11}>Report of Expert Session</Text>
                    <Text style={styles.t22}>on </Text>
                    <Text style={styles.t22}>"{title}"</Text> 
                    <Text style={styles.t22}>Conducted on  </Text>
                    <Text style={styles.t22}>"{eventDate}   from {eventTime}" </Text>
                    <Text style={styles.t33}>Organized by  </Text>
                    {organizer.map((org, index) => (
                        <Text key={index} style={styles.t33}>{org}</Text>
                        ))}
                    <Text style={styles.t22}> {'\n'}  {'\n'}  {'\n'}  Department of Information Technology, {'\n'} 
                    Pune Institute of Computer Technology, Pune.</Text>
                
                    <Image style={styles.img} src="/pda_front.png"></Image>
                </View>         
            </Page>

            {/* Event Details Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                    <Text style={[styles.t1, { marginBottom: 2 }]}>
                        Society for Computer Technology & Research's{'\n'}
                        <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                        <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                    </Text>
                </View> 
                <View style={styles.section}>
                    <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>

                    <View style={styles.tt2}>
                        <Text style={styles.t44}>Course Name:  </Text>
                        <Text style={styles.t55}>{courseName}  </Text>
                    </View>

                    <View style={styles.tt2}>
                        <Text style={styles.t44}>Mode of Conduction :  </Text>
                        <Text style={styles.t55}>{mode}    </Text>
                    </View>

                    <View style={styles.tt2}>
                        <Text style={styles.t44}>Link : </Text>
                        <Text style={styles.t69}>{link} </Text>
                    </View>

                    <View style={styles.tt2}>
                        <Text style={styles.t44}>Number of Students participated : </Text>
                        <Text style={styles.t55}> {participants}</Text>
                    </View>

                    <Text style={styles.t66}>Organized by:</Text>
                    {organizer.map((org, index) => (
                        <Text key={index} style={styles.t77}>{org}</Text>
                    ))}

                    <Text style={styles.t66}>Objective:</Text>
                    {objectives.map((objective, index) => (
                        <Text key={index} style={styles.t77}>{index + 1}. {objective}</Text>
                    ))}

                    <Text style={styles.t66}>OutCome:</Text>
                    <Text style={styles.t77}>The Participants will be able to</Text>
                    {outcomes.map((outcome, index) => (
                        <Text key={index} style={styles.t77}>{index + 1}. {outcome}</Text>
                    ))}
                </View> 
            </Page>

            {/* CO/PO/PSO and Resource Person Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                    <Text style={[styles.t1, { marginBottom: 2 }]}>
                        Society for Computer Technology & Research's{'\n'}
                        <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                        <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                    </Text>
                </View> 
                <View style={styles.section}>
                    <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                    <Text style={styles.t66}>CO / PO / PSOs Addressed:</Text>
                    
                    <View style={styles.table}>
                        {/* Table Header Row */}
                        <View style={styles.tableRow}>
                            <View style={[styles.tableColHeader, { width: '20%' }]}>
                                <Text style={styles.tableCellHeader}>CO/PO/PSO Code</Text>
                            </View>
                            <View style={[styles.tableColHeader, { width: '80%' }]}>
                                <Text style={styles.tableCellHeader}>Description</Text>
                            </View>
                        </View>
                        
                        {/* Table Data Rows */}
                        {coPoMapping.map((mapping, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={[styles.tableCol, { width: '20%' }]}>
                                    <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{mapping.code}</Text>
                                </View>
                                <View style={[styles.tableCol, { width: '80%' }]}>
                                    <Text style={[styles.tableCell, { textAlign: 'left', paddingLeft: 5 }]}>{mapping.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.t66}>Name of Resource Person:</Text>
                    { resourcePerson.map((person, index) => (
                        <Text key={index} style={styles.t77}>{person}</Text>
                        ))}

                    <Text style={styles.t66}>Impact Analysis:</Text>
                    {impactAnalysis.map((impact, index) => (
                        <View key={index} style={styles.tt}>
                            <Text style={styles.t99}>{index + 1}. {impact.title}: {impact.content} </Text>
                        </View>
                    ))}
                </View>
            </Page>

            {/* Extra Sections Page */}
            {data.extraSections && data.extraSections.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.headerRow}>
                        <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                        <Text style={[styles.t1, { marginBottom: 2 }]}>
                            Society for Computer Technology & Research's{'\n'}
                            <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                            <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                        </Text>
                    </View> 
                    <View style={styles.section}>
                        <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                        
                        {data.extraSections.map((section, index) => (
                            <View key={index} style={{ marginBottom: 15 }}>
                                <Text style={styles.t66}>{section.title}:</Text>
                                <Text style={styles.t77}>{section.description}</Text>
                            </View>
                        ))}
                    </View>
                </Page>
            )}

            {/* Photos Page - Event Images (First 4 images) */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                    <Text style={[styles.t1, { marginBottom: 2 }]}>
                        Society for Computer Technology & Research's{'\n'}
                        <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                        <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                    </Text>
                </View> 
                <View style={styles.section}>
                    <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                    <Text style={styles.t5}>Photographs of the Event:</Text>
                    
                    <View style={styles.gridContainer}>
                        {/* Show exactly 4 images per page */}
                        {categorizedImages.team && categorizedImages.team.length > 0 ? (
                            categorizedImages.team.slice(0, 4).map((image, index) => (
                                <View key={index} style={styles.borderedImageContainer}>
                                    <SafeImage src={image} style={styles.borderedImage} />
                                </View>
                            ))
                        ) : (
                            <Text style={styles.t66}>No Photographs of the Event</Text>
                        )}
                    </View>
                </View>
            </Page>
            
            {/* Photos Page - Team/Event Images (Additional images if more than 4) */}
            {categorizedImages.team && categorizedImages.team.length > 4 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.headerRow}>
                        <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                        <Text style={[styles.t1, { marginBottom: 2 }]}>
                            Society for Computer Technology & Research's{'\n'}
                            <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                            <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                        </Text>
                    </View> 
                    <View style={styles.section}>
                        <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                        <Text style={styles.t5}>Photographs of the Event (Continued):</Text>
                        
                        <View style={styles.gridContainer}>
                            {/* Show images 5-8 */}
                            {categorizedImages.team.slice(4, 8).map((image, index) => (
                                <View key={index} style={styles.borderedImageContainer}>
                                    <SafeImage src={image} style={styles.borderedImage} />
                                </View>
                            ))}
                            
                            {/* Add placeholders if fewer than 4 additional images */}
                            {categorizedImages.team.length < 8 && 
                                Array.from({ length: 8 - categorizedImages.team.length }).map((_, index) => (
                                    <View key={`placeholder-${index}`} style={styles.borderedImageContainer}>
                                        <SafeImage src="/Picture2.jpg" style={styles.borderedImage} />
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </Page>
            )}

            {/* Photos Page - Speakers/Resource Persons - One page only */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                    <Text style={[styles.t1, { marginBottom: 2 }]}>
                        Society for Computer Technology & Research's{'\n'}
                        <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                        <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                    </Text>
                </View> 
                <View style={styles.section}>
                    <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                    <Text style={styles.t5}>Question set for Feedback:</Text>
                    
                    <View style={styles.gridContainer}>
                        {/* Show exactly 4 question set images */}
                        {categorizedImages.speakers && categorizedImages.speakers.length > 0 ? (
                            categorizedImages.speakers.slice(0, 4).map((image, index) => (
                                <View key={index} style={styles.borderedImageContainer}>
                                    <SafeImage src={image} style={styles.borderedImage} />
                                </View>
                            ))
                        ) : (
                            <Text style={styles.t66}>No Question Set Images</Text>
                        )}
                    </View>
                </View>
            </Page>

            {/* Feedback Analysis Pages - Two charts per page, stacked vertically */}
            {data && data.chartImages && data.chartImages.length > 0 ? (
                // Calculate how many pages we need - each page shows 2 charts
                Array.from({ length: Math.ceil(data.chartImages.length / 2) }).map((_, pageIndex) => (
                    <Page key={`feedback-page-${pageIndex}`} size="A4" style={styles.page}>
                        <View style={styles.headerRow}>
                            <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                            <Text style={[styles.t1, { marginBottom: 2 }]}>
                                Society for Computer Technology & Research's{'\n'}
                                <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                                <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                            </Text>
                        </View> 
                        <View style={[styles.section, { padding: 5 }]}>
                            <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                            <Text style={[styles.t5, { marginBottom: 4 }]}>
                                {pageIndex === 0 ? "Feedback Analysis Charts:" : "Feedback Analysis Charts (Continued):"}
                            </Text>

                            <View style={{
                                marginTop: 0,
                                marginBottom: 0,
                                display: 'flex',
                                flexDirection: 'column', 
                                width: '100%'
                            }}>
                                {/* Show two charts for this page - start with pageIndex*2 */}
                                {data.chartImages.slice(pageIndex * 2, pageIndex * 2 + 2).map((img, index) => {
                                    const chartNumber = pageIndex * 2 + index + 1;
                                    const chartTitle = typeof img === 'object' && img.title ? img.title : `Chart ${chartNumber}`;
                                    
                                    return (
                                        <View key={index} style={{
                                            width: '100%',
                                            marginBottom: 10,
                                            borderWidth: 1,
                                            borderColor: '#e0e0e0',
                                            borderRadius: 3,
                                            overflow: 'hidden'
                                        }}>
                                            {/* Chart title in a header-like container */}
                                            <View style={{
                                                backgroundColor: '#f5f5f5',
                                                paddingVertical: 4,
                                                paddingHorizontal: 8,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#e0e0e0'
                                            }}>
                                                <SafeText style={{ 
                                                    fontSize: 12,
                                                    fontWeight: 'bold', 
                                                    textAlign: 'left'
                                                }}>
                                                    {chartTitle}
                                                </SafeText>
                                            </View>
                                            
                                            {/* Chart image */}
                                            <View style={{
                                                padding: 4,
                                                backgroundColor: 'white'
                                            }}>
                                                <SafeImage 
                                                    src={typeof img === 'object' ? (img.src || img) : img} 
                                                    style={{
                                                        width: '100%',
                                                        height: 230,
                                                        objectFit: 'contain'
                                                    }} 
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </Page>
                ))
            ) : (
                // Show a single page with a message if no charts available
                <Page size="A4" style={styles.page}>
                    <View style={styles.headerRow}>
                        <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                        <Text style={[styles.t1, { marginBottom: 2 }]}>
                            Society for Computer Technology & Research's{'\n'}
                            <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                            <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                        </Text>
                    </View> 
                    <View style={styles.section}>
                        <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                        <Text style={styles.t5}>Feedback Analysis Charts:</Text>
                        
                        <View style={[styles.section, { marginTop: 50 }]}>
                            <SafeText style={{ fontSize: 14, textAlign: 'center' }}>
                                No feedback charts available. Please upload feedback data to generate charts.
                            </SafeText>
                        </View>
                    </View>
                </Page>
            )}

            {/* Attendance Data Page - now displaying all entries without pagination */}
            {renderAttendanceData()}

            {/* Approval Letters & Documents Pages - One document per page, full page size */}
            {certificateImages && certificateImages.length > 0 ? (
                // Map each certificate to its own page
                certificateImages.map((certificateImage, index) => {
                    // Handle different formats of image data
                    let imageSrc = certificateImage;
                    
                    // Handle object format if it has an 'original' or 'src' property
                    if (typeof certificateImage === 'object') {
                        if (certificateImage.original) {
                            imageSrc = certificateImage.original;
                        } else if (certificateImage.src) {
                            imageSrc = certificateImage.src;
                        }
                    }
                    
                    return (
                        <Page key={`certificate-page-${index}`} size="A4" style={styles.page}>
                            <View style={styles.headerRow}>
                                <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                                <Text style={[styles.t1, { marginBottom: 2 }]}>
                                    Society for Computer Technology & Research's{'\n'}
                                    <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                                    <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                                </Text>
                            </View> 
                            <View style={[styles.section, { paddingTop: 5, marginTop: 0 }]}>
                                <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                                <Text style={[styles.t5, { marginBottom: 10 }]}>
                                    {index === 0 ? "Expert Session Notice/Approval Letters:" : `Approval Document ${index + 1}:`}
                                </Text>
                                
                                <View style={styles.fullPageImageContainer}>
                                    <Image 
                                        src={imageSrc} 
                                        style={styles.approvalImage}
                                    />
                                </View>
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.t3}>
                                {/* {data.facultyName || 'Faculty Name'} */}
                                {'\n'}                                                                                    
                                Name of Organizer                                                                                            HoD-IT  {'\n'} 
                                {organizer}                                                                                           Dr. A. S. Ghottkar {'\n'}
                                </Text>
                            </View>
                        </Page>
                    );
                })
            ) : (
                // If no certificate images found, return null to avoid showing empty page
                
                <Page size="A4" style={styles.page}>
                    <View style={styles.headerRow}>
                        <Image style={[styles.logoImage, { height: 65, width: 70 }]} src="/pict_logo.png" />
                        <Text style={[styles.t1, { marginBottom: 2 }]}>
                            Society for Computer Technology & Research's{'\n'}
                            <Text style={styles.title}> PUNE INSTITUTE OF COMPUTER TECHNOLOGY{'\n'} </Text>
                            <Text style={styles.t1}>  __________________________________________________{'\n'}</Text>
                        </Text>
                    </View> 
                    <Text style={styles.t1}>Department of Information Technology{'\n'}</Text>
                    <Text style={styles.t5}>Approval Letters & Documents:</Text>
                    <Text style={styles.t66}>No Approval Letters & Documents</Text>
                    <View style={styles.section}>
                        <Text style={styles.t3}>
                        {/* {data.facultyName || 'Faculty Name'} */}
                        {'\n'}                                                                                    
                        Name of Organizer                                                                                            HoD-IT  {'\n'} 
                        {organizer}                                                                                           Dr. A. S. Ghotkar {'\n'}
                        </Text>
                    </View>
                </Page>
            )}
        </Document>
    );
};

export default MyDocument;
