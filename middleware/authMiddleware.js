const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkUser = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,process.env.JWT_SECRET_KEY,async(err,decodedToken)=>{
            if(err){
                res.locals.user = null;
                next();
            }else{
                
                const user = await User.findById(decodedToken.id);
              
                res.locals.user = user;
                next();
            }
            
        });
    }else{
        res.locals.user = null;
        next();
    }
}

module.exports = {
    checkUser
}