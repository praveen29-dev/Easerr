import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { rateLimit } from 'express-rate-limit';
import { syncJobApplicationCounts } from './utils/syncCounts.js';
import { setupSwagger } from './config/swagger.js';

// Initialize Express
const app = express()

// Connect to database
await connectDB()

// Sync application counts on server startup
syncJobApplicationCounts()
  .then(result => {
    if (result.success) {
      console.log('Initial application count sync completed');
    } else {
      console.error('Error during initial application count sync:', result.message);
    }
  })
  .catch(err => {
    console.error('Failed to run initial application count sync:', err);
  });

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.' }
});

// Apply rate limiting to auth endpoints
app.use('/api/auth', apiLimiter);

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: true
}))

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'))

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.get('/', (req, res) => res.send("API WORKING"))
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`);
})