const express = require('express');
const userRoute = express();

const userController = require('../controllers/userController');
const prodectController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const profileController = require('../controllers/profileController');
const wishlistController = require('../controllers/wishlistController')

const validate = require('../middleware/authMiddleware');
const block = require('../middleware/blockMiddleware');

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

userRoute.get('/cart',block.checkBlocked,validate.requireAuth,cartController.loadCart);
userRoute.post('/addToCart/:id',validate.requireAuth,cartController.addToCart);
userRoute.put('/change-product-quantity',cartController.updateQuantity)
userRoute.delete("/delete-product-cart",cartController.deleteProduct);

userRoute.get('/dashboard',block.checkBlocked,validate.requireAuth,profileController.loadDashboard)
userRoute.get('/profileDetails',block.checkBlocked,validate.requireAuth,profileController.profile)
userRoute.get('/profileAddress',block.checkBlocked,validate.requireAuth,profileController.profileAdress)
userRoute.post('/submitAddress',profileController.submitAddress)
userRoute.post('/updateAddress',profileController.editAddress)
userRoute.get('/deleteAddress',profileController.deleteAddress)
userRoute.get('/wallet',profileController.walletTransaction)

 
userRoute.post('/checkOutAddress',profileController.checkOutAddress)
userRoute.post('/changeDefaultAddress',orderController.changePrimary)

userRoute.post('/editPassword',userController.editPassword)
userRoute.post('/editInfo',userController.editInfo)

   
userRoute.get('/checkOut',block.checkBlocked,validate.requireAuth,orderController.checkOut);
userRoute.post('/checkOut',block.checkBlocked,validate.requireAuth,orderController.postCheckOut);

userRoute.get('/profileOrderList',block.checkBlocked,validate.requireAuth,orderController.orderList)
userRoute.put('/cancelOrder',orderController.cancelOrder)  

userRoute.get('/orderDetails',block.checkBlocked,validate.requireAuth,orderController.orderDetails)

userRoute.post('/verifyPayment',orderController.verifyPayment)  
userRoute.post('/paymentFailed',orderController.paymentFailed)  

userRoute.get('/couponVerify/:id',orderController.verifyCoupon)
userRoute.get('/applyCoupon/:id/:total',orderController.applyCoupon)

userRoute.get('/invoice',orderController.downloadInvoice)

userRoute.post('/add-to-wishlist',wishlistController.addWishList)
userRoute.get('/wishlist',validate.requireAuth,block.checkBlocked,wishlistController.getWishList)
userRoute.delete('/remove-product-wishlist',wishlistController.removeProductWishlist)
 

 


module.exports = userRoute;
