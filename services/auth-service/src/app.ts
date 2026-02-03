import express from 'express'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import studentRoutes from "./routes/student.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app=express()

app.use(cors())
app.use(cookieParser()); 

app.use(express.json())

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.use('/auth',authRoutes)
app.use('/user',userRoutes)

// protected role-based routes
app.use("/student", studentRoutes);
app.use("/instructor", instructorRoutes);
app.use("/admin", adminRoutes);



export default app