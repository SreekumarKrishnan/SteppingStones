
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const otpHelper = require('../helpers/otpHelper');
const userHelper = require('../helpers/userHelper');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Banner = require('../models/bannerModel');

const maxAge = 3*24*60*60;
const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET_KEY,{
        expiresIn:maxAge
    });
};

const bcrypt = require('bcrypt');

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
  
}


const homeLoad = async(req,res)=>{
    try {
        
        const banner = await Banner.find({}) 
        const category = await Category.find({ })
        res.render("home",{user:res.locals.user,category,banner})
    } catch (error) {
        console.log(error.message);
    }
}
const loadSignup = async (req,res)=>{
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
    }
}
const loadLogin = async (req,res)=>{
    try {
        if(res.locals.user){
            res.redirect('/');
        }else{
            res.render('login');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async(req,res)=>{
    //need destructuring
    
    const {fname, lname, email, mno, password, confPassword } = req.body;
    
    const existingUser = await User.findOne({email:email})
    if (!fname || fname.trim().length === 0) {
        return res.render("signup", { message: "Name is required" });
    }
    if (/\d/.test(fname) || /\d/.test(lname)) {
        return res.render("signup", { message: "Name should not contain numbers" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
        return res.render("signup", { message: "Email Not Valid" });
    }
    if(existingUser){
      return res.render("signup",{message:"Email already exists"})
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mno)) {
        return res.render("signup", { message: "Mobile Number should have 10 digit" });

    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(password)){
        return res.render("signup", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }

   


    if(password!= confPassword){
        return res.render("signup", { message: "Password and Confirm Password must be same" });
    }
   

    const otp =otpHelper.generateOtp();
    //await otpHelper.sendOtp(req.body.mno,otp);
    console.log(`otp is ${otp}`);

    try {
     req.session.otp = otp;
     req.session.userData = req.body;
     req.session.mobile = req.body.mno;
     res.render('verifyOtp');
    } catch (error) {
        console.log(error.message);
    }
}

const resendOtp = async (req,res)=>{
    try {
        const userData = req.session.userData;
        if(!userData){
            res.status(400).json({message:"Invalid or expaired session"});
        }
        const otp = otpHelper.generateOtp();
        req.session.otp = otp;
        //await otpHelper.sendOtp(req.session.mobile,req.session.otp);
        console.log(`Resend otp is ${req.session.otp}`);
        res.render('verifyOtp',{message:"OTP resent successfully"});

        
    } catch (error) {
        console.log("Error: ",error);
        res.render('verifyOtp',{message:"Failed to send otp"});
    }
}

const verifyOtp = async (req,res)=>{
    const otp = req.body.otp;
    try {
        const sessionOTP = req.session.otp;
        const userData = req.session.userData;
        if(!sessionOTP||!userData){
            res.render('verifyOtp',{message:"Invalid session"});
        }else if(sessionOTP!==otp){
            res.render('verifyOtp',{message:"Invalid otp"});
        }else{
            const spassword = await securePassword(userData.password);
            const user = new User({
                fname:userData.fname,
                lname:userData.lname,
                email:userData.email,
                mobile:userData.mno,
                password:spassword
            });
            const userDataSave = await user.save();
            if(userDataSave){
                const token = createToken(user._id);
                res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000});
                res.redirect('/');
            }else{
                res.render('signup',{message:"Registration failed"});
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    const data = req.body;
    const result = await userHelper.verifyLogin(data);
    if(result.error){
        res.render('login',{message:result.error});
    }else{
        const token = result.token;
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000});
        res.redirect('/');
    }
    

}

const logout = async (req,res) =>{
    res.cookie('jwt', '' ,{maxAge : 1})
    res.redirect('/')
}

const loadForgotPassword = async(req,res)=>{
    try {
       res.render('forgotPassword'); 
    } catch (error) {
        console.log(error.message);
    }
}

const forgotPasswordOtp = async(req,res)=>{
    const user = await User.findOne({mobile:req.body.mobile});
    if(!user){
        res.render('forgotPassword',{message:"User not registered"});
    }else{
        const otp = otpHelper.generateOtp();
        //await otpHelper.sendOtp(user.mobile,otp);
        console.log(`Forgot password otp is ${otp}`);
        req.session.otp = otp;
        req.session.email = user.email;
        res.render('forgotPasswordOtp');
    }
}

const resetPasswordOtpVerify = async(req,res)=>{
    try {
        const otp = req.session.otp;
        if(otp===req.body.otp){
            res.render('resetPassword');
        }else{
            res.render('forgotPasswordOtp',{message:"Your otp was wrong"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const setNewPassword = async(req,res)=>{
   try {
    const newPassword = req.body.newpassword;
    const newConfPassword = req.body.confpassword;
    
    const email = req.session.email;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if(!passwordRegex.test(newPassword)){
        res.render('resetPassword',{message:"Password should contain atleast 8 charecter, one number and a special charecter"});
    }

    if(newPassword===newConfPassword){
        const spassword = await securePassword(newPassword);
        await User.updateOne({email:email},{$set:{password:spassword}});
        res.redirect('/login');
    }else{
        res.render('resetPassword',{message:"New Password and Confirm Password is not matching"});
    }
   } catch (error) {
    console.log(error.message);
   }
}

const editInfo = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const { fname, lname, email, mobile } = req.body;
  
      const result = await User.updateOne(
        { _id: userId }, // Specify the user document to update based on the user ID
        { $set: { fname, lname, email, mobile } } // Set the new field values
      );
  
      res.redirect("/profile");
    } catch (error) {
      console.log(error.message);
      res.redirect('/error-500')

    }
  };
  
const editPassword = async (req, res) => {
    try {
      const newPass = req.body.newPassword;
      // const confPass = req.body.confPass;
      const userId = res.locals.user._id;
        const spassword = await securePassword(newPass);
  
        const result = await User.updateOne(
          { _id: userId },
          { $set: { password: spassword } }
        );
  
        res.send({status:true});
      
    } catch (error) {
      console.log(error.message);
    }
  };

  const displayProduct = async (req, res) => {
    try {
      const category = await Category.find({});
      const page = parseInt(req.query.page) || 1;
      const limit = 2;
      const skip = (page - 1) * limit; // Calculate the number of products to skip
      const searchQuery = req.query.search || ''; // Get the search query from request query parameters
      const sortQuery = req.query.sort || 'default'; // Get the sort query from request query parameters (default value is 'default')
      const minPrice = parseFloat(req.query.minPrice); // Get the minimum price from request query parameters
      const maxPrice = parseFloat(req.query.maxPrice)

  
      // Build the search filter
      const searchFilter = {
        $and: [
          { isListed: true },
          { isProductListed: true },
          {
            $or: [
              { name: { $regex: new RegExp(searchQuery, 'i') } },
            ],
          },
        ],
      };
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        searchFilter.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
      }

      let sortOption = {};
      if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
        sortOption = { price: 1 }; 
      } else if (sortQuery === 'price_desc') {
        sortOption = { price: -1 }; 
      }
  
      const totalProducts = await Product.countDocuments(searchFilter); // Get the total number of products matching the search query
      const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages
  
      const products = await Product.find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate('category');
  
      res.render('shop', { product: products, category, currentPage: page, totalPages });
    } catch (error) {
      console.log(error.message);
      res.redirect('/error-500')

    }
  };

  const categoryPage = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const category = await Category.find({});
        const product = await Product.find({ category: categoryId, $and: [{ isListed: true }, { isProductListed: true }] })
            .populate('category');
        
        res.render('categoryShop', { product, category });
    } catch (error) {
        console.log('category page error', error);
    }
};

  

module.exports={
    homeLoad,
    loadSignup,
    loadLogin,
    insertUser,
    verifyOtp,
    verifyLogin,
    logout,
    resendOtp,
    loadForgotPassword,
    forgotPasswordOtp,
    resetPasswordOtpVerify,
    setNewPassword,
    displayProduct,
    categoryPage,
    editInfo,
    editPassword
}