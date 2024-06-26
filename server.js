const express = require('express');
const connectDB = require('./config/dbConnection');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser');
const multer = require('multer'); // Import multer

dotenv.config();

const app = express();

connectDB();

// Apply body-parser middleware for JSON parsing
app.use(express.json());

// Configure multer for file uploads
//const upload = multer({ dest: 'uploads/' });

app.use(cors({
    origin: 'https://yetisplustask.vercel.app', // Replace with your client’s domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If your requests include credentials
    allowedHeaders: 'Content-Type, Authorization'
}));

// Route-specific middleware
//app.use('/api/admin/ads', upload.single('image'));

// Serve static files (images) from the 'uploads' directory
//app.use('/uploads', express.static('uploads'));

// Route handlers
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
