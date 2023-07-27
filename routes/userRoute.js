const express = require('express');
const userRoute = express();

const userController = require('../controllers/userController');
const prodectController = require('../controllers/productController');
const validate = require('../middleware/authMiddleware');

const session = require('express-session');
const nocache = require('nocache');
const cookieParser = require('cookie-parser');
require('dotenv').config();

userRoute.use(nocache());

userRoute.use(session({
   secret:process.env.SESSION_SECRET_KEY,
   resave:false,
   saveUninitialized:true
}));

userRoute.set('view engine','ejs');
userRoute.set('views','./views/users');

userRoute.use(express.json());
userRoute.use(express.urlencoded({extended:true}));
userRoute.use(cookieParser());




userRoute.all('*',validate.checkUser);
userRoute.get('/',userController.homeLoad);
userRoute.get('/signup',userController.loadSignup);
userRoute.post('/signup',userController.insertUser);
userRoute.get('/resendOtp',userController.resendOtp);
userRoute.post('/verifyOtp',userController.verifyOtp);
userRoute.get('/login',userController.loadLogin);
userRoute.post('/login',userController.verifyLogin);
userRoute.get('/logout',userController.logout);
userRoute.get('/forgotPassword',userController.loadForgotPassword);
userRoute.post('/forgotPasswordOtp',userController.forgotPasswordOtp);
userRoute.post('/resetPasswordOtpVerify',userController.resetPasswordOtpVerify);
userRoute.post('/setNewPassword',userController.setNewPassword);

userRoute.get('/shop',userController.displayProduct);
userRoute.get('/categoryShop',userController.categoryPage);
userRoute.get('/productPage',prodectController.productPage);






module.exports = userRoute;
