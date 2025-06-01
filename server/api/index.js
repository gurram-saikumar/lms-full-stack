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

// Initialize database connection
let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return;
  
  try {
    await connectDB();
    await connectCloudinary();
    console.log('Database and Cloudinary connected successfully');
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
};

// Routes
app.get('/', async (req, res) => {
  try {
    await initializeApp();
    res.send("API Working");
  } catch (error) {
    res.status(500).send("Failed to initialize application");
  }
});

app.post('/clerk', express.json(), clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

// Export the Express API
export default app; 