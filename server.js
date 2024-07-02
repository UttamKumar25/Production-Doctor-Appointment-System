const express= require('express')
const cors = require('cors');
const colors= require('colors')
const morgan= require('morgan')
const dotenv= require('dotenv');
const connectDB = require('./config/db');
const path=require('path')
//dotenv config
dotenv.config();

// connect to database
connectDB();
//rest object
const app=express();

//middlewares // Use morgan middleware for logging HTTP requests

app.use(morgan('dev'));

app.use(cors());
app.use(express.json());//for parsing

//routes
app.use('/api/v1/user',require("./routes/userRoutes"));
app.use('/api/v1/admin',require("./routes/adminRoutes"));
app.use('/api/v1/doctor', require("./routes/doctorRoutes"))
//static files
app.use(express.static(path.join(__dirname, "./client/build")))

app.get('*',function(req,res){
    res.sendFile(path.join(__dirname, "./client/build/index.html"))
})

//port // Set the port dynamically using an environment variable, with a default value
const port= 8080;
//listen port
app.listen(port,()=>{
    console.log(`Server is running in ${process.env.NODE_MODE} Mode on port ${port}`);
})