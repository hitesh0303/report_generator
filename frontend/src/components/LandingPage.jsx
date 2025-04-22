import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaChartBar, FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSignInAlt } from 'react-icons/fa';
import member1 from '../assets/image_hitesh.png';
import member2 from '../assets/image_savani.png';
import man from '../assets/image_sir.png';
import woman from '../assets/image_maam.png';
import member3 from '../assets/image_anuja.png';

const LandingPage = () => {
  // Smooth scroll to section when clicking nav links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Report types data
  const reportTypes = [
    {
      title: 'Teaching Activity Report',
      icon: <FaChalkboardTeacher className="text-4xl mb-4 text-blue-600" />,
      description: 'Generate comprehensive reports for teaching activities, including student feedback and learning outcomes.',
      link: '/create-report',
      color: 'blue'
    },
    {
      title: 'PDA Report',
      icon: <FaChartBar className="text-4xl mb-4 text-purple-600" />,
      description: 'Create detailed Professional Development Activity reports with charts and analytics.',
      link: '/create-pda-report',
      color: 'purple'
    },
    {
      title: 'Expert Session Report',
      icon: <FaUserTie className="text-4xl mb-4 text-orange-600" />,
      description: 'Document expert sessions, workshops, and special lectures with comprehensive reporting.',
      link: '/create-expert-report',
      color: 'orange'
    }
  ];

  // Team members data
  const teamMembers = [
    {
      name: 'Hitesh Sonawane',
      role: 'Frontend Developer',
      image: member1,
    },
    {
      name: 'Savani Sonawane',
      role: 'Backend Developer',
      image: member2,
    },
    {
      name: 'Anuja Sapkal',
      role: 'Full Stack Developer',
      image: member3,
    }
  ];

  // Mentors data
  const mentors = [
    {
      name: ' Mr. Ravi Murumkar',
      role: 'Project Mentor',
      image: man,
    },
    {
      name: 'Mrs. Rashmi Chhattani',
      role: 'Project Mentor',
      image: woman,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/pict_logo.png" alt="PICT Logo" className="h-15 w-16 mr-3" />
              <span className="text-xl font-bold text-gray-800">PICT Report Generator</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-1600 hover:text-blue-600">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-1600 hover:text-blue-600">About</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-1600 hover:text-blue-600">Contact</button>
              <Link 
                to="/login" 
                className="text-gray-1600 hover:text-blue-600"
              >
                {/* <FaSignInAlt className="mr-2" /> */}
                Login
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => scrollToSection('mobile-menu')} 
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          <div className="md:hidden">
            <div id="mobile-menu" className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => scrollToSection('home')} 
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600"
              >
                Contact
              </button>
              <Link 
                to="/login" 
                className="block w-full px-3 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <FaSignInAlt className="inline mr-2" />
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="pt-24 pb-16 relative">
        {/* Background Image */}
        {/* <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url("/image.png")',
            opacity: '1'
          }}
        /> */}
        
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl py-10 font-bold text-center text-gray-800 mb-12">Report Generation System</h1>
          <div className="grid md:grid-cols-3 gap-8">
            {reportTypes.map((report, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300 border-t-4 border-${report.color}-500`}>
                <div className="text-center">
                  {report.icon}
                  <h3 className="text-xl font-semibold mb-4">{report.title}</h3>
                  <p className="text-gray-600 mb-6">{report.description}</p>
                  <Link
                    to="/login"
                    className={`inline-block px-6 py-2 bg-${report.color}-600 text-white rounded-lg hover:bg-${report.color}-700 transition duration-300`}
                  >
                    Create Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Team</h2>
          
          {/* Team Members */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">Development Team</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
                  <h4 className="text-xl font-semibold">{member.name}</h4>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mentors */}
          <div>
            <h3 className="text-2xl font-semibold text-center mb-8">Project Mentors</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {mentors.map((mentor, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <img src={mentor.image} alt={mentor.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
                  <h4 className="text-xl font-semibold">{mentor.name}</h4>
                  <p className="text-gray-600">{mentor.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Contact Us</h2>
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-blue-600 mr-3" />
                    <p>PICT, Dhankawadi, Pune, Maharashtra 411043</p>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-blue-600 mr-3" />
                    <p>+91 20 2437 1101</p>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-blue-600 mr-3" />
                    <p>registrar@pict.edu</p>
                  </div>
                </div>
              </div>
              <div>
                <iframe
                  title="PICT Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.5761897254445!2d73.84865661489991!3d18.45742798744385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2eac85230ba47%3A0x871eddd0a8a0a108!2sPune%20Institute%20of%20Computer%20Technology!5e0!3m2!1sen!2sin!4v1647887138080!5m2!1sen!2sin"
                  className="w-full h-64 rounded-lg"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 