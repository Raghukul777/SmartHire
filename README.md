# SmartHire - Intelligent Recruitment Platform

A modern, full-stack recruitment workflow platform built with the MERN stack. SmartHire streamlines the hiring process with state-machine driven application workflows, intelligent candidate matching, and real-time notifications.

## 🚀 Features

- **State-Machine Workflow**: Applications follow a defined lifecycle (APPLIED → SCREENING → TECHNICAL → INTERVIEW → HR → OFFER → HIRED/REJECTED)
- **Role-Based Access**: Separate interfaces for Candidates, Recruiters, and Admins
- **Smart Matching**: AI-powered candidate-job matching based on skills
- **Real-Time Notifications**: Stay updated on application status changes
- **Kanban Board**: Visual pipeline management for recruiters
- **Resume Management**: PDF upload and storage
- **Responsive Design**: Beautiful UI with smooth animations using Framer Motion

## 🛠️ Tech Stack

### Frontend
- **React** (v19.2.0) - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** (v3.4.17) - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Node.js** & **Express** - Server framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/SmartHire.git
cd SmartHire
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# - Set a strong JWT_SECRET
# - Configure MONGO_URI (local or MongoDB Atlas)
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env if your backend runs on a different port
```

### 4. Database Setup
Make sure MongoDB is running locally, or use MongoDB Atlas:

**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas:**
- Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGO_URI` in `backend/.env`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
SmartHire/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware (auth, upload)
│   ├── scripts/          # Utility scripts
│   ├── uploads/          # Resume storage (gitignored)
│   ├── .env.example      # Environment template
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/          # API client configuration
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   └── index.css     # Global styles
│   ├── .env.example      # Environment template
│   └── vite.config.js    # Vite configuration
│
└── .gitignore            # Git ignore rules
```

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smarthire
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:5000
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (Recruiter only)

### Applications
- `POST /api/applications/:jobId` - Apply for job
- `GET /api/applications/me` - Get my applications
- `GET /api/applications/job/:jobId` - Get job applications (Recruiter)
- `PUT /api/applications/:id/stage` - Update application stage

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 👥 User Roles

### Candidate
- Browse and search jobs
- Apply to positions with resume upload
- Track application status
- Receive notifications

### Recruiter
- Post job openings
- View applications in Kanban board
- Move candidates through workflow stages
- Schedule interviews
- Make offers

### Admin
- Manage all users and jobs
- System-wide analytics
- Workflow configuration

## 🎨 UI Features

- **Sliding Auth Panel**: Smooth transition between login/register
- **Glassmorphism**: Modern frosted glass effects
- **Micro-animations**: Delightful hover and transition effects
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: CSS variables for easy theming

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- File upload validation
- CORS configuration
- Environment variable protection

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or check your MONGO_URI in .env
```

### Port Already in Use
```bash
# Change PORT in backend/.env
# Update VITE_API_URL in frontend/.env accordingly
```

### File Upload Issues
```bash
# Ensure uploads directory exists
mkdir backend/uploads

# Check file permissions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations

---

**Happy Hiring! 🎉**
