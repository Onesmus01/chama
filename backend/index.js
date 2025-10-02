import express from 'express';
import cors from 'cors';
import moment from 'moment';
import db from './config/db.js';
import cookieParser from 'cookie-parser';
import router from './routes/members.js';
import contributionRouter from './routes/contribution.js';
import cloudinary from 'cloudinary';
import withdrawalRouter from './routes/withdrawal.js';
import dotenv from 'dotenv';
import paymentRouter from './routes/payment.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// ✅ Fix proxy issue for Render
app.set("trust proxy", 1);

// Hardcoded base URL
const BASE_URL = "https://chama-9.onrender.com";

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Helmet security
app.use(helmet());
app.use(helmet.contentSecurityPolicy({ useDefaults: true }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.noSniff());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ CORS configuration
app.use(cors({
  origin: [
    "http://localhost:4173",
    BASE_URL,
    "https://chama-2r6y.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(cookieParser());

// ✅ Webhook logger middleware
app.post('/api/payment/mpesa/webhook', (req, res, next) => {
  console.log("✅ M-Pesa Webhook Hit at:", moment().format());
  console.log("🔹 Headers:", req.headers);
  console.log("🔹 Body:", JSON.stringify(req.body, null, 2));
  next(); // pass control to paymentRouter
});

// General request logger (after cors)
app.use((req, res, next) => {
  console.log(`[${moment().format()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routers
app.use('/api/members', router);
app.use('/api/withdraw', withdrawalRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/contribution', contributionRouter); // Mount contributionRouter under a prefix

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Root route
app.get('/', (req, res) => {
  res.send(`Server is running at ${BASE_URL}`);
});

const PORT = process.env.PORT || 6500;
app.listen(PORT, () => console.log(`🚀 Server is listening at ${BASE_URL}`));
