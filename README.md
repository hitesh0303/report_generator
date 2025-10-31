A full-stack web application to generate and manage reports, including:

PDA Reports

Expert Session Reports

Teaching Activity Reports

Users can fill forms, generate PDF reports, view previous reports, and analyze feedback. Built using React.js, Node.js, Express, and MongoDB, with Cloudinary integration for file management.

Features

User Authentication: Register/login with JWT-based security

Report Management: Create, view, and download PDFs

Feedback Analysis: Charts for visual insights

Cloud Support: Upload and manage images/files

Error Handling: Frontend and backend centralized error management

Tech Stack

Frontend: React.js, Tailwind CSS, Axios

Backend: Node.js, Express.js, MongoDB, Mongoose

File Storage: Cloudinary

PDF Generation: React components

Deployment: Vercel (frontend), Render/Heroku (backend)

Project Structure
Backend
backend/
├── middleware/authMiddleware.js
├── models/Report.js, User.js
├── routes/auth.js, report.js
├── server.js
├── scripts/fix-db.js
└── package.json

Frontend
frontend/
├── src/components/       # Forms, PDF views, charts
├── src/context/          # AuthContext
├── src/utils/            # Axios & Cloudinary utilities
├── App.jsx
└── index.jsx

Installation & Usage

Clone Repo

git clone https://github.com/hitesh0303/report_generator/
cd report-generator


Backend

cd backend
npm install
npm start


Frontend

cd frontend
npm install
npm run dev


Environment Variables

Backend .env: MONGO_URI, JWT_SECRET, CLOUDINARY_*

Frontend .env: VITE_API_URL, VITE_CLOUDINARY_*
