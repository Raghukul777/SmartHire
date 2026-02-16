const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Import path module for file handling

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes'); // Import Application routes
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();
connectDB();

const app = express();

// --- Middlewares ---
app.use(express.json()); // Allow JSON data
app.use(cors()); // Allow Frontend to communicate

// Make the 'uploads' folder accessible publicly (so we can view resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Server Start ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});