import express from 'express'
import cors from 'cors'
import moment from 'moment'
import db from './config/db.js'
import cookieParser from 'cookie-parser'
import router from './routes/members.js'
import contributionRouter from './routes/contribution.js'
import cloudinary from 'cloudinary';
import withdrawalRouter from './routes/withdrawal.js'
import dotenv from 'dotenv'
import paymentRouter from './routes/payment.js'
dotenv.config()

const app = express()

// Middleware to parse raw body for webhook processing
app.use('/api/payment/mpesa/webhook', express.raw({ type: '*/*' }));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
  })
)

app.use(cookieParser())
app.use('/api/members', router)
app.use('/api/withdraw', withdrawalRouter)
app.use('/api/payment', paymentRouter)
app.use(contributionRouter)

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const logger = async (req, res, next) => {
  console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}-${moment().format()}`)
  next()
}

app.use(logger)

app.get('/', (req, res) => {
  res.send('working')
})

const PORT = process.env.PORT || 6500;

app.listen(PORT, () => console.log(`server is listening at port ${PORT}`))
