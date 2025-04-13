import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
// Import our static images
import { pictLogo, pdaLogo, pdafront, certificateTemplate, teamPhotoPlaceholder, winnerPhotoPlaceholder } from '../assets/pda/logo.js';

// Add styles for image gallery
const styles = StyleSheet.create({
    page: { 
        padding: 20, 
        backgroundColor: '#FFFFFF',
        flexDirection: 'column'
    },
    section: { 
        marginBottom: 10, 
        padding: 10 
    },
    title: { 
        fontSize: 18, 
        textAlign: 'center', 
        marginBottom: 10 
    },
    image: { 
        width: 180,     // Smaller size for two-column layout
        height: 150, 
        marginBottom: 10 
    },
    staticImage: {
        width: '100%',
        maxWidth: 400,
        height: 'auto',
        maxHeight: 260,
        objectFit: 'contain',
        alignSelf: 'center',
        marginBottom: 5
    },
    staticImage1: {
        width: '100%',
        maxWidth: 400,
        height: 'auto',
        maxHeight: 600,
        objectFit: 'contain',
        alignSelf: 'center',
        marginBottom: 10
    },
    logoImage: {
        width: 100,
        height: 70,
        alignSelf: 'center',
        marginBottom: 10
    },
    chartContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 25,
        marginBottom: 36
    },
    chartItem: {
        width: '45%',   // Ensures two columns
        textAlign: 'center',
        marginBottom: 20
    },
    chartTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5
    },
    placeholderBox: {
        width: 180,
        height: 150,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 10,
        marginBottom: 10
    },
    largePlaceholderBox: {
        width: 400,
        height: 100,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 10,
        marginVertical: 10
    },
    certificatePlaceholderBox: {
        width: 400,
        height: 200,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 10,
        marginVertical: 10
    },
    logoPlaceholderBox: {
        width: 100,
        height: 70,
        margin: 'auto',
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 5
    },
    placeholderText: {
        fontSize: 10
    },
    largePlaceholderText: {
        fontSize: 12
    },
    t3: { fontSize: 13, textAlign: 'left', marginBottom: 8 },
    t5: { fontSize: 13, textAlign: 'left', marginBottom: 8 , fontWeight: 'bold'},
    t4: { fontSize: 13, textAlign: 'left', marginLeft: 30 },
    t2: { fontSize: 12, textAlign: 'center', marginBottom: 10 },
    chartImage: { 
        width: 600, 
        height: 'auto',
        maxHeight: 550, 
        objectFit: 'contain',
        marginVertical: 5,
        alignSelf: "center",
        marginBottom: 15
    },
    t1: { fontSize: 20, textAlign: 'center', marginBottom: 10, color: "red" },
    header: { textAlign: 'center', fontSize: 16, marginBottom: 10 },
    table: { display: 'table', width: '100%' },
    tableRow: { flexDirection: 'row' },
    tableCellHeader: { 
        flex: 1, 
        padding: 5, 
        borderWidth: 1, 
        borderColor: '#000', 
        borderStyle: 'solid', 
        backgroundColor: '#E4E4E4', 
        textAlign: 'center', 
        fontSize: 12 
    },
    tableCell: { 
        flex: 1, 
        padding: 5, 
        borderWidth: 1, 
        borderColor: '#000', 
        borderStyle: 'solid', 
        textAlign: 'center', 
        fontSize: 12 
    },
    img2: { width: 100, height: 70, alignSelf: 'center', marginBottom: 10 },
    img: { width: 400, height: 300, alignSelf: 'center', marginBottom: 10 },
    boldText: { fontSize: 13 },
    list: { marginTop: 5, paddingLeft: 20, fontSize: 13 },
    line: { borderBottomWidth: 1, borderBottomColor: '#000', width: '100%', marginVertical: 10 },
    // Add new styles for image galleries
    imageGallery: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginVertical: 10
    },
    galleryImage: {
        width: '45%',
        height: 150,
        objectFit: 'contain',
        margin: 5
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center'
    },
    // Add new styles for enhanced statistics
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
        width: 100,
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
        width: 50,
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

// Default faculty and students data
const defaultFaculty = [
    { name: 'Mr. Sachin Pande', role: 'Head – Professional Development Committee' },
    { name: 'Mrs. Amruta Patil', role: 'Member of PDA' },
    { name: 'Mr. ViniTribhuvan', role: 'Member of PDA' }
];
  
const defaultStudents = [
    'Rudraksh Khandelwal',
    'Mikhiel Benji',
    'Akshay Raut',
    'Om Patil'
]; 

// Try/catch wrapper for safe text display
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
        
        // Handle Cloudinary URLs directly
        if (typeof src === 'string' && (
            src.includes('cloudinary.com') || 
            src.startsWith('http') || 
            src.startsWith('/')
        )) {
            return <Image src={src} style={style} />;
        }
        
        // Handle objects with src property (our chart image format)
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
        
        // No valid image source and no fallback - show empty box with message
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
        // Fallback to placeholder on error
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

// Component to render a gallery of images with a fallback to default image
const ImageGallery = ({ images = [], defaultImage, style, title, maxImages = 4 }) => {
    const hasImages = images && images.length > 0;
    
    return (
        <View style={{ marginBottom: 15 }}>
            {/*{title && <SafeText style={styles.sectionTitle}>{title}</SafeText>}*/}
            
            {hasImages ? (
                <View style={styles.imageGallery}>
                    {images.slice(0, maxImages).map((image, index) => (
                        <SafeImage 
                            key={index}
                            src={image} 
                            style={style || styles.galleryImage}
                            fallbackSrc={defaultImage}
                        />
                    ))}
                </View>
            ) : (
                <View style={{ alignItems: 'center' }}>
                    <SafeImage 
                        src={defaultImage}
                        style={style || styles.staticImage}
                    />
                </View>
            )}
        </View>
    );
};

const ReportPDAPDF = ({ data = {} }) => {
    // Extract data with fallbacks to prevent errors
    const {
        title = "Knowledge Assessment Quiz",
        targetAudience = "Students",
        date = new Date().toLocaleDateString(),
        time = "11:00 am to 12:00 pm",
        organizedBy = "Professional Development Activity Committee",
        committeeType = "Professional Development Activity Committee",
        institution = "Pune Institute of Computer Technology",
        venue = "Google Form",
        fee = "0",
        participants = "230",
        faculty = defaultFaculty,
        students = defaultStudents,
        objectives = [],
        execution = "",
        outcomes = [],
        impactAnalysis = [],
        feedback = [],
        chartImages = [],
        excelData = [],
        // Extract categorized images with fallbacks
        categorizedImages = {
            team: [],
            winners: [],
            certificates: [],
            general: []
        },
        // Legacy support for uncategorized images
        images = [],
        // Add Extra Sections
        extraSections = []
    } = data;

    // Legacy support: if categorizedImages is not provided but images are, 
    // use images array for general category
    if (!categorizedImages.general.length && images && images.length) {
        categorizedImages.general = images;
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.title}>A {'\n'} Report On </SafeText>
                    <SafeText style={styles.t1}> {title}</SafeText>
                    
                    <SafeText style={styles.title}>For{'\n'} {targetAudience} {'\n'}</SafeText>
                    <SafeText style={styles.title}>  On {'\n'} {date} {'\n'} </SafeText>

                    <SafeText style={styles.title}> Organised by</SafeText>
                    {/* Use SafeImage component for the logo */}
                    <View style={{ alignItems: 'center' }}>
                        <Image src="/pda.png" style={styles.logoImage} />
                    </View>
                    <SafeText style={styles.title}> {committeeType}</SafeText> 
                    <SafeText style={styles.title}>Society for Computer Technology and Research's {'\n'}
                    {institution} {'\n'} </SafeText>
                    <SafeText style={styles.t2}> Sr No. 27 Pune-Satara Road, Dhankawadi,{'\n'}
                    Pune, Maharashtra 411043. (www.pict.edu)</SafeText>
                    <View style={{ alignItems: 'center' }}>
                        <Image src="/pda_front.png" style={styles.img} />
                    </View> 
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.t5}>Report: </SafeText>
                    <SafeText style={styles.t3}>A knowledge assessment quiz '{title}' for {targetAudience} organized by {committeeType}, {institution}, Pune </SafeText>

                    <SafeText style={styles.t5}>To: </SafeText>
                    <SafeText style={styles.t3}>{targetAudience}, {institution}, Pune</SafeText>
                    
                    <SafeText style={styles.t5}>From: PDA Core team</SafeText>

                    <View style={styles.section}>
                        <SafeText style={styles.t5}>Faculty Members:</SafeText>
                        {faculty.map((member, index) => (
                            <SafeText key={index} style={styles.list}>{index + 1}. {member.name || member}</SafeText>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <SafeText style={styles.t5}>Students:</SafeText>
                        {students.map((name, index) => (
                            <SafeText key={index} style={styles.list}>{index + 1}. {name}</SafeText>
                        ))}
                    </View>

                    <SafeText style={styles.t5}>Date and time of conduction: </SafeText>
                    <SafeText style={styles.t5}>Date: {date}</SafeText>
                    <SafeText style={styles.t5}>Time: {time}</SafeText>
                    <SafeText style={styles.t5}>Venue: {venue}</SafeText>
                    <SafeText style={styles.t5}>Fees: {fee}</SafeText>
                    <SafeText style={styles.t5}>Number of participants: {participants}</SafeText>

                    <View style={{ marginTop: 10 }}>
                        <SafeText style={styles.t5}>Organized by:</SafeText>
                        {faculty.map((member, index) => (
                            <SafeText key={index} style={styles.t3}>
                                {member.name || member}{member.role ? `, ${member.role}` : ''}
                                {index === faculty.length - 1 ? '' : ','}
                            </SafeText>
                        ))}
                        <SafeText style={styles.t3}>Department of Information Technology, {institution}, Pune.</SafeText>
                    </View>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.t5}> Objectives: </SafeText>
                    {objectives && objectives.length > 0 ? (
                        objectives.map((objective, index) => (
                            <SafeText key={index} style={styles.t3}>{index + 1}. {objective}{'\n'}</SafeText>
                        ))
                    ) : (
                        <>
                            <SafeText style={styles.t3}>1. Foster a competitive yet supportive environment to encourage skill showcasing and mutual learning. {'\n'}</SafeText>
                            <SafeText style={styles.t3}>2. Assess participants' skills dynamically and challenge them in a lively quiz setting. {'\n'}</SafeText>
                            <SafeText style={styles.t3}>3. Facilitate in-depth domain knowledge acquisition essential for success in future internships and placements. {'\n'}</SafeText>
                        </>
                    )}

                    <SafeText style={styles.t5}> Execution: </SafeText>
                    <SafeText style={styles.t3}>{execution || "A knowledge assessment quiz to help students in placement and internship selection process, was held on the specified date. The quiz focused on data structures and algorithms."}</SafeText>

                    <SafeText style={styles.t5}> Outcomes: </SafeText>
                    {outcomes && outcomes.length > 0 ? (
                        outcomes.map((outcome, index) => (
                            <SafeText key={index} style={styles.t3}>{index + 1}. {outcome}{'\n'}</SafeText>
                        ))
                    ) : (
                        <>
                            <SafeText style={styles.t3}>1. Participants will demonstrate improved proficiency in the assessed skills, indicating growth and development in their knowledge areas. {'\n'}</SafeText>
                            <SafeText style={styles.t3}>2. Attendees will acquire a deeper understanding of the domain, enhancing their expertise and readiness for future internship and placement opportunities. {'\n'}</SafeText>
                            <SafeText style={styles.t3}>3. The top scorers will be honored with a special gift, fostering a sense of achievement and motivation among participants. {'\n'}</SafeText>
                        </>
                    )}

                    {/* Add Extra Sections after outcomes */}
                    {extraSections && extraSections.length > 0 && (
                        <>
                            <SafeText style={styles.t5}>Additional Information:</SafeText>
                            {extraSections.map((section, index) => (
                                <View key={index} style={styles.section}>
                                    <SafeText style={styles.t5}>{section.title}:</SafeText>
                                    <SafeText style={styles.t3}>{section.description}{'\n'}</SafeText>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.t5}> Impact Analysis: </SafeText>
                    {impactAnalysis && impactAnalysis.length > 0 ? (
                        impactAnalysis.map((impact, index) => (
                            <SafeText key={index} style={styles.t3}>{index + 1}. {impact}{'\n'}</SafeText>
                        ))
                    ) : (
                        <>
                            <SafeText style={styles.t3}>1. Enhanced problem solving and critical thinking {'\n'}</SafeText>
                            <SafeText style={styles.t3}>2. Preparation for future tests for internships and placements{'\n'}</SafeText>
                            <SafeText style={styles.t3}>3. Increased awareness of knowledge gaps{'\n'}</SafeText>
                            <SafeText style={styles.t3}>4. Overall readiness for internships and placements {'\n'}</SafeText>
                        </>
                    )}

                    <SafeText style={styles.t5}> Team </SafeText>
                    {/* Use ImageGallery component for team photos */}
                    <ImageGallery 
                        images={categorizedImages.team}
                        defaultImage="/team.png"
                        style={styles.staticImage}
                        //title="Team Members"
                        maxImages={4}
                    />

                    <SafeText style={styles.t5}> Winners </SafeText>
                    {/* Use ImageGallery component for winner photos */}
                    <ImageGallery 
                        images={categorizedImages.winners}
                        defaultImage="/winners.png"
                        style={styles.staticImage}
                        //title="Award Recipients"
                        maxImages={4}
                    />
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.t5}> Certificate: </SafeText>
                    {/* Use ImageGallery component for certificate images */}
                    <ImageGallery 
                        images={categorizedImages.certificates}
                        defaultImage="/certificate.png"
                        style={styles.staticImage1}
                        //title="Participation & Achievement Certificates"
                        maxImages={2}
                    />

                    {/* If there are additional general images, display them */}
                    {categorizedImages.general && categorizedImages.general.length > 0 && (
                        <>
                            <SafeText style={styles.t5}> Event Highlights </SafeText>
                            <ImageGallery 
                                images={categorizedImages.general}
                                defaultImage="/pda_front.png"
                                style={styles.staticImage}
                                //title="Event Photos"
                                maxImages={4}
                            />
                        </>
                    )}
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.title}>Student Performance Analysis:</SafeText>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <SafeText style={styles.tableCellHeader}>Sr No</SafeText>
                            <SafeText style={styles.tableCellHeader}>Roll Number</SafeText>
                            <SafeText style={styles.tableCellHeader}>Name</SafeText>
                            <SafeText style={styles.tableCellHeader}>Marks</SafeText>
                        </View>
                        {excelData && excelData.length > 0 ? (
                            excelData.map((row, index) => (
                                <View style={styles.tableRow} key={index}>
                                    <SafeText style={styles.tableCell}>{row['Sr No']}</SafeText>
                                    <SafeText style={styles.tableCell}>{row['Roll Number']}</SafeText>
                                    <SafeText style={styles.tableCell}>{row['Name']}</SafeText>
                                    <SafeText style={styles.tableCell}>{row['Marks']}</SafeText>
                                </View>
                            ))
                        ) : (
                            // If there's no student performance data, show a message instead of dummy data
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCell, { flex: 4, textAlign: 'center' }]}>
                                    <SafeText>No student performance data available. Please upload an Excel file with student data.</SafeText>
                                </View>
                            </View>
                        )}
                    </View>
                    
                    {/* Add some statistics if we have excel data */}
                    {excelData && excelData.length > 0 && (
                        <View style={styles.statsContainer}>
                            <SafeText style={styles.statsTitle}>Performance Statistics</SafeText>
                            
                            {/* Main stats cards in a 2x2 grid */}
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <SafeText style={styles.statCardTitle}>Total Students</SafeText>
                                    <SafeText style={styles.statCardValue}>{excelData.length}</SafeText>
                                </View>
                                
                                <View style={[styles.statCard, { borderColor: '#4a90e2' }]}>
                                    <SafeText style={styles.statCardTitle}>Average Score</SafeText>
                                    <SafeText style={styles.statCardValue}>
                                        {(excelData.reduce((sum, student) => sum + (parseInt(student['Marks']) || 0), 0) / excelData.length).toFixed(2)}
                                    </SafeText>
                                </View>
                                
                                <View style={[styles.statCard, { borderColor: '#4caf50' }]}>
                                    <SafeText style={styles.statCardTitle}>Highest Score</SafeText>
                                    <SafeText style={styles.statCardValue}>
                                        {Math.max(...excelData.map(student => parseInt(student['Marks']) || 0))}
                                    </SafeText>
                                </View>
                                
                                <View style={[styles.statCard, { borderColor: '#f44336' }]}>
                                    <SafeText style={styles.statCardTitle}>Lowest Score</SafeText>
                                    <SafeText style={styles.statCardValue}>
                                        {Math.min(...excelData.filter(student => parseInt(student['Marks']) > 0).map(student => parseInt(student['Marks']) || 0))}
                                    </SafeText>
                                </View>
                            </View>
                            
                            {/* Pass/Fail statistics */}
                            <View style={styles.passFailContainer}>
                                {(() => {
                                    const totalStudents = excelData.length;
                                    const passingMark = 40; // Assuming 40 is passing mark
                                    const passedStudents = excelData.filter(student => parseInt(student['Marks']) >= passingMark).length;
                                    const passPercentage = ((passedStudents / totalStudents) * 100).toFixed(1);
                                    const failPercentage = (100 - passPercentage).toFixed(1);
                                    
                                    return (
                                        <>
                                            <View style={[styles.passFailStat, styles.passRate]}>
                                                <SafeText style={styles.statCardTitle}>Pass Rate</SafeText>
                                                <SafeText style={[styles.statCardValue, { color: '#2e7d32' }]}>{passPercentage}%</SafeText>
                                                <SafeText style={{ fontSize: 11, color: '#2e7d32' }}>{passedStudents} students</SafeText>
                                            </View>
                                            
                                            <View style={[styles.passFailStat, styles.failRate]}>
                                                <SafeText style={styles.statCardTitle}>Fail Rate</SafeText>
                                                <SafeText style={[styles.statCardValue, { color: '#c62828' }]}>{failPercentage}%</SafeText>
                                                <SafeText style={{ fontSize: 11, color: '#c62828' }}>{totalStudents - passedStudents} students</SafeText>
                                            </View>
                                        </>
                                    );
                                })()}
                            </View>
                            
                            {/* Grade Distribution */}
                            <View style={styles.gradeDistribution}>
                                <SafeText style={[styles.statCardTitle, { marginBottom: 10, textAlign: 'center' }]}>Grade Distribution</SafeText>
                                
                                {(() => {
                                    const gradeRanges = [
                                        { min: 90, max: 100, label: 'Excellent (90-100)', color: '#4caf50' },
                                        { min: 75, max: 89, label: 'Very Good (75-89)', color: '#8bc34a' },
                                        { min: 60, max: 74, label: 'Good (60-74)', color: '#cddc39' },
                                        { min: 40, max: 59, label: 'Average (40-59)', color: '#ffeb3b' },
                                        { min: 0, max: 39, label: 'Needs Improvement', color: '#f44336' }
                                    ];
                                    
                                    const totalStudents = excelData.length;
                                    
                                    return gradeRanges.map((grade, index) => {
                                        const studentsInGrade = excelData.filter(
                                            student => parseInt(student['Marks']) >= grade.min && parseInt(student['Marks']) <= grade.max
                                        ).length;
                                        
                                        const percentage = (studentsInGrade / totalStudents) * 100;
                                        
                                        return (
                                            <View style={styles.gradeRow} key={index}>
                                                <SafeText style={styles.gradeLabel}>{grade.label}</SafeText>
                                                <View style={[styles.gradeBar, { width: `${percentage}%`, backgroundColor: grade.color }]} />
                                                <SafeText style={styles.gradeValue}>{studentsInGrade} ({percentage.toFixed(1)}%)</SafeText>
                                            </View>
                                        );
                                    });
                                })()}
                            </View>
                        </View>
                    )}
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.title}>Feedback Analysis Report</SafeText>

                    {chartImages && chartImages.length > 0 ? (
                        chartImages.map((img, index) => (
                            <View key={index} style={{ marginBottom: 10 }}>
                                <SafeText style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                                    {typeof img === 'object' && img.title ? img.title : `Chart ${index + 1}`}
                                </SafeText>
                                <SafeImage 
                                    src={typeof img === 'object' ? (img.src || img) : img} 
                                    style={styles.chartImage} 
                                />
                            </View>
                        ))
                    ) : (
                        <View style={styles.section}>
                            <SafeText style={{ fontSize: 12, textAlign: 'center' }}>
                                No feedback charts available. Please upload feedback data to generate charts.
                            </SafeText>
                        </View>
                    )}
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <SafeText style={styles.t5}> Descriptive Feedback </SafeText>
                    {feedback && feedback.length > 0 ? (
                        feedback.map((item, index) => (
                            <SafeText key={index} style={styles.t3}>{index + 1}. {item}{'\n'}</SafeText>
                        ))
                    ) : (
                        <>
                            <SafeText style={styles.t3}>1. This test was really helpful for our Placement preparation {'\n'}</SafeText>
                            <SafeText style={styles.t3}>2. Very good quality questions!{'\n'}</SafeText>
                            <SafeText style={styles.t3}>3. Great experience{'\n'}</SafeText>
                            <SafeText style={styles.t3}>4. Keep taking similar quizes {'\n'}</SafeText>
                            <SafeText style={styles.t3}>5. Quiz level was medium and excellent quality of questions. {'\n'}</SafeText>
                            <SafeText style={styles.t3}>6. Quiz is good but its too lengthy{'\n'}</SafeText>
                            <SafeText style={styles.t3}>7. Best quiz ever!! {'\n'}</SafeText>
                        </>
                    )}
                </View>
            </Page>
        </Document>
    );
};

export default ReportPDAPDF; 