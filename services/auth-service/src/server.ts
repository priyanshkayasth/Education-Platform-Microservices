import "dotenv/config";        
import app from "./app.js";
import connectDB from "./config/db.js";
import { MONGO_URI } from './config/env.js';
import { connectRabbitMQ } from "./config/rabbitmq.js";

const PORT=process.env.PORT || 3001

connectDB(MONGO_URI)
connectRabbitMQ()

app.listen(PORT,()=>{
    console.log(`Auth service is running on ${PORT}`);
    
})