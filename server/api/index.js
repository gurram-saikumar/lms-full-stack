import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from '../configs/postgres.js';
import connectCloudinary from '../configs/cloudinary.js';
import userRouter from '../routes/userRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import { clerkWebhooks, stripeWebhooks } from '../controllers/webhooks.js';
import educatorRouter from '../routes/educatorRoutes.js';
import courseRouter from '../routes/courseRoute.js';

const app = express();

// Middlewares
app.use(cors());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => res.send("API Working"));
app.post('/clerk', express.json(), clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

// Initialize database connection
const initializeApp = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    console.log('Database and Cloudinary connected successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Initialize the app
initializeApp();

// Export the Express API
export default app; 