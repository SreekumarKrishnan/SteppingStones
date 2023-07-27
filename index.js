const express = require('express');
const app = express();

const connectDB = require('./configuration/connectMongoDB');
connectDB('mongodb://127.0.0.1:27017/steppingstones');

const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use(express.static(__dirname+'/public'));

app.use('/',userRoute);
app.use('/admin',adminRoute);

app.listen(4000,()=>{
    console.log("http://localhost:4000");
}) 