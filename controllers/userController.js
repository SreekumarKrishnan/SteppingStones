
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
    const email = req.body.email;
    const mobileNumber = req.body.mno
    const existingUser = await User.findOne({email:email}) 

    if(existingUser){
      return res.render("signup",{message:"Email already exists"})
    }

    if(req.body.password!=req.body.confPassword){
        return res.render("signup", { message: "Password and Confirm Password must be same" });
    }

    await otpHelper.sendOtp(mobileNumber)
    try {
        req.session.userData = req.body;
        req.session.mobile = mobileNumber 
        res.render('verifyOtp')
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
 
    }
}

const resendOTP = async (req, res) => {
    const mobileNumber = req.session.mobile
    try {
      // Retrieve user data from session storage
      const userData = req.session.userData;
  
      if (!userData) {
        res.status(400).json({ message: 'Invalid or expired session' });
      }
  
      // Generate and send new OTP using Twilio


      await otpHelper.sendOtp(mobileNumber)
  
      res.render('verifyOtp',{ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Error: ', error);
      res.render('verifyOtp',{ message: 'Failed to send otp' });
    }
  };
  

const verifyOtp = async(req,res)=>{
    const otp = req.body.otp
    try {
    const userData = req.session.userData;
    const verified = await otpHelper.verifyCode(userData.mno,otp)

    if(verified){
    const spassword =await securePassword(userData.password)
        const user = new User({
            fname:userData.fname,
            lname:userData.lname,
            email:userData.email,
            mobile:userData.mno,
            password:spassword,
            is_admin:0
        })
        const userDataSave = await user.save()
        if(userDataSave){
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect('/')
        }else{
            res.render('register',{message:"Registration Failed"})
        }
      }else{
        res.render('verifyOtp',{ message: 'Wrong Otp' });

      }


    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
     
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

const forgotPasswordOtp = async(req, res)=>{       
    const user = await User.findOne({mobile : req.body.mobile})                                     
    // req.session.number = number
    if(!user){
        res.render('forgotPassword',{message:"User Not Registered"})
    }else{
        await otpHelper.sendOtp(user.mobile)
        req.session.email = user.email 
        req.session.mobile = req.body.mobile
        res.render('forgotPasswordOtp')
    }
     
  }
  
  const resetPasswordOtpVerify = async (req,res)  => {
      try{
          const mobile = req.session.mobile
          const reqOtp = req.body.otp
          const verified = await otpHelper.verifyCode(mobile,reqOtp)
          const otpHolder = await User.find({ mobile : req.body.mobile })
          if(verified){
              res.render('resetPassword')
          }
          else{
              res.render('forgotPasswordOtp',{message:"Your OTP was Wrong"})
          }
      }catch(error){
          console.log(error);
          res.redirect('/error-500')
  
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
    resendOTP,
    loadForgotPassword,
    forgotPasswordOtp,
    resetPasswordOtpVerify,
    setNewPassword,
    displayProduct,
    categoryPage,
    editInfo,
    editPassword
}