const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const couponController = require('../controllers/couponController');
const bannerController = require('../controllers/bannerController');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const nocache = require('nocache');
 const validate = require('../middleware/adminAuth');
const { createCategory } = require('../helpers/categoryHelper');
const multer = require('../multer/multer');

require('dotenv').config();

adminRoute.use(nocache());
adminRoute.use(session({
    secret:process.env.ADMIN_SESSION_SECRET_KEY,
    resave:false,
    saveUninitialized:true
}));

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({extended:true}));
adminRoute.use(cookieparser());
adminRoute.all('*',validate.checkUser);

adminRoute.get('/dashboard',validate.requireAuth,adminController.loadDashboard);
adminRoute.get('/',adminController.loadLogin);
adminRoute.post('/login',adminController.verifyLogin);
adminRoute.get('/users',adminController.loadUsers);
adminRoute.get('/logout',adminController.logout);
adminRoute.get('/blockUser',adminController.blockUser);
adminRoute.get('/unBlockUser',adminController.unBlockUser);

adminRoute.get('/category',validate.requireAuth,categoryController.loadCategory);
adminRoute.get('/addCategory',validate.requireAuth,categoryController.loadAddCategory);
adminRoute.post('/createCategory',validate.requireAuth,categoryController.createCategory);
adminRoute.get('/unListCategory',validate.requireAuth,categoryController.unListCategory);
adminRoute.get('/reListCategory',validate.requireAuth,categoryController.reListCategory);
adminRoute.get('/editCategory',validate.requireAuth,categoryController.loadUpdateCategory);
adminRoute.post('/updateCategory',validate.requireAuth,categoryController.updateCategory);

adminRoute.get('/displayProduct',validate.requireAuth,productController.displayProduct);
adminRoute.get('/addProduct',validate.requireAuth,productController.addProduct);
adminRoute.post('/createProduct',multer.upload,productController.createProduct);
adminRoute.get('/unListProduct',productController.unListProduct);
adminRoute.get('/reListProduct',productController.reListProduct);
adminRoute.get('/loadUpdateProduct',validate.requireAuth,productController.loadUpdateProduct);
adminRoute.post('/updateProduct',multer.upload,productController.updateProduct);
  
adminRoute.get('/orderList',validate.requireAuth,adminController.orderList);
adminRoute.get('/orderDetails',validate.requireAuth,adminController.orderDetails)
adminRoute.put('/orderStatus',adminController.changeStatus);
adminRoute.put('/cancelOrder',adminController.cancelOrder);
adminRoute.put('/returnOrder',adminController.returnOrder);

adminRoute.get('/couponList',validate.requireAuth,couponController.couponList)
adminRoute.get('/addCoupon',validate.requireAuth,couponController.loadCouponAdd)
adminRoute.get('/generate-coupon-code',validate.requireAuth,couponController.generateCouponCode)
adminRoute.post('/addCoupon',couponController.addCoupon)
adminRoute.get('/editCoupon',couponController.loadCouponEdit)
adminRoute.patch('/editCoupon',couponController.updateCouponDetails)
adminRoute.delete('/removeCoupon',couponController.removeCoupon)

adminRoute.get('/salesReport',validate.requireAuth,adminController.getSalesReport)
adminRoute.post('/salesReport',adminController.postSalesReport)

adminRoute.get('/bannerList',validate.requireAuth,bannerController.bannerList)
adminRoute.get('/addBanner',validate.requireAuth,bannerController.addBannerGet)
adminRoute.post('/addBanner',multer.addBannerupload,bannerController.addBannerPost)
adminRoute.get('/deleteBanner',bannerController.deleteBanner)








module.exports = adminRoute;

