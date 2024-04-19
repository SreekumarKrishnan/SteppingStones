const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sreekumartk759:vd6xIQIv74EPYurW@cluster0.3zwma2b.mongodb.net/')



const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
app.use(express.static(__dirname+'/public'));

app.use('/',userRoute);
app.use('/admin',adminRoute);

app.listen(5000,()=>{
    console.log("http://localhost:5000");     
}) 
