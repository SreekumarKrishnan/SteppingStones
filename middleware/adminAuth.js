const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
require('dotenv').config();

const checkUser = (req,res,next)=>{
    const token = req.cookies.jwtAdmin;
    if(token){
        jwt.verify(token,process.env.JWT_ADMIN_SECRET_KEY, async (err,decodedToken)=>{
            if(err){
                res.locals.admin = null;
                next();
            }else{
                const admin = await Admin.findById(decodedToken.id);
                res.locals.admin = admin;
                next();
            }
        });
    }else{
       res.locals.admin =null;
       next(); 
    }
}

const requireAuth = (req,res,next)=>{
    const token = req.cookies.jwtAdmin;
    if(token){
        jwt.verify(token,process.env.JWT_ADMIN_SECRET_KEY, async(err,decodedToken)=>{
            if(err){
                res.redirect('/admin');
            }else{
                const admin = await Admin.findById(decodedToken.id);
                res.locals.admin = admin;
                next();
            }
        });
    }else{
        res.redirect('/admin');
    }
}

module.exports = {
    checkUser,
    requireAuth
}