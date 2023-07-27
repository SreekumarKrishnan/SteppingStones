const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
// const { locals } = require('../routes/userRoute');
require('dotenv').config();

const maxAge = 3*24*60*60;
const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_ADMIN_SECRET_KEY,{
        expiresIn:maxAge
    });
};

const loadLogin = async (req,res)=>{
    try {
        if(res.locals.admin!==null){
            res.redirect('/admin/users');
        }else{
            res.render('login');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req,res)=>{
    try {
        const username = req.body.username;
        const password = req.body.password;

        const adminData = await Admin.findOne({userName:username});
        if(adminData.password===password){
            if(adminData){
                const token = createToken(adminData._id);
                res.cookie('jwtAdmin',token,{httpOnly:true,maxAge:maxAge*1000});
                res.redirect('/admin/users');
            }else{
                res.render('login',{message:"Email and password are incorrect"});
            }
        }else{
            res.render('login',{message:"Email and password are incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadUsers = async (req,res)=>{
    try {
        var search = ''
    if(req.query.search){
        search = req.query.search
    }
    const usersData = await User.find({
        $or:[
            {fname:{$regex:'.*'+search+'.*',$options:'i'}},
            {lname:{$regex:'.*'+search+'.*',$options:'i'}},
            {email:{$regex:'.*'+search+'.*',$options:'i'}},
            {mobile:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
    });
        res.render('users',{user:usersData});
    } catch (error) {
        console.log(error.message);
    }
}

const logout = (req,res) =>{
    res.cookie('jwtAdmin', '' ,{maxAge : 1})
    res.redirect('/admin')
  
}

const blockUser = async (req,res)=>{
    try {
        const id = req.query.id;
        await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}});
        res.redirect('/admin/users');
    } catch (error) {
        console.log(error.message);
    }
}

const unBlockUser = async (req,res)=>{
    try {
        const id = req.query.id;
        await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}});
        res.redirect('/admin/users');
    } catch (error) {
        console.log(error.message);
    }
}

    

module.exports = {
    loadLogin,
    verifyLogin,
    loadUsers,
    logout,
    blockUser,
    unBlockUser
}
