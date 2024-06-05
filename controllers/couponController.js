const couponHelper = require('../helpers/couponHelper')
const Coupon = require('../models/couponModel')


const couponList = async(req,res)=>{
    try {
        const couponList = await Coupon.find().sort({'createdAt':-1})
        res.render('couponList',{couponList})
    } catch (error) {
        
    }
}

const loadCouponAdd = async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}

const loadCouponEdit = async (req,res)=>{
    try {
        const data = await Coupon.findOne({_id:req.query.id}) 
        const couponDetails = data.toObject()
        couponDetails['couponId']= req.query.id
        

        res.render('editCoupon',{couponDetails}) 
    } catch (error) {
        console.log(error);
    }
}

const updateCouponDetails = async (req,res)=>{
    try {
        await couponHelper.updateCoupon(req.body)
        res.json({status :true})
    } catch (error) {
        console.log(error);
    }
}

const generateCouponCode = (req,res)=>{
    couponHelper.generatorCouponCode().then((couponCode) => { 
        res.send(couponCode);
      });
}

const addCoupon =  (req, res) => {
    try {
        const data = {
            couponCode: req.body.coupon,
            validity: req.body.validity,
            minPurchase: req.body.minPurchase,
            minDiscountPercentage: req.body.minDiscountPercentage,
            maxDiscountValue: req.body.maxDiscount,
            description: req.body.description,
          };
          couponHelper.addCoupon(data).then((response) => {
            res.json(response);
          });
        
    } catch (error) {
        console.log(error.message);
        
        
    }
   
}

const removeCoupon = async(req,res)=>{
    try {
        const id = req.body.couponId
        await Coupon.deleteOne({_id:id})
        res.json({status:true})
        
    } catch (error) {
        console.log(error.message);
    }
}
 
module.exports = {
    couponList,
    loadCouponAdd,
    generateCouponCode,
    addCoupon,
    removeCoupon,
    loadCouponEdit,
    updateCouponDetails
}