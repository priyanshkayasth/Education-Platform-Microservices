import express from 'express'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import studentRoutes from "./routes/student.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import cors from 'cors'
import cookieParser from 'cookie-parser';
import passport from './config/passport.js'

const app=express()
app.set('trust proxy',1)

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(cookieParser()); 

app.use(express.json())

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.use(passport.initialize());

app.use('/auth',authRoutes)
app.use('/user',userRoutes)

// protected role-based routes
app.use("/student", studentRoutes);
app.use("/instructor", instructorRoutes);
app.use("/admin", adminRoutes);



export default app