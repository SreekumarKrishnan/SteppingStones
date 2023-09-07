const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const productHelper = require('../helpers/productHelper');


const displayProduct = async (req,res)=>{
    try {
        const product = await Product.find().populate('category');
        res.render('displayProduct',{product:product});
    } catch (error) {
        console.log(error.message);
    }
}
const addProduct = async (req,res)=>{
    try {   
        const category = await Category.find();
        res.render('addProduct',{category:category});
    } catch (error) {
        console.log(error.message);
    }
}

const createProduct = async (req,res)=>{
    try {
        const categories = await Category.find();
        if(!req.body.name||req.body.name.trim().length === 0){
            return res.render('addProduct',{message:"Name is required",category:categories});
        }
        if(req.body.price<=0){
            return res.render('addProduct',{message:"Product price should be greater than zero",category:categories});
        }
        if(req.body.stock<=0){
            return res.render('addProduct',{message:"Stock should be greater than zero",category:categories});
        }
        const images = req.files.map(file => file.filename);
        await productHelper.createProduct(req.body,images);
        
        res.redirect('/admin/displayProduct');

    } catch (error) {
       console.log(error.message); 
    }
}

const unListProduct = async (req,res)=>{
    try {
        await productHelper.unListProduct(req.query.id);
        res.redirect('/admin/displayProduct');
    } catch (error) {
        console.log(error.message);
    }
}

const reListProduct = async (req,res)=>{
    try {
        await productHelper.reListProduct(req.query.id);
    
        res.redirect('/admin/displayProduct');
    } catch (error) {
        console.log(error);
    }
}

const loadUpdateProduct = async (req,res)=>{
    try {
        const category = await Category.find();
        const product = await Product.findById({_id:req.query.id});
        res.render('updateProduct',{product:product,category:category});
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async (req,res)=>{
    try {
        const productData = await Product.findById(req.body.id);
        
        const images = req.files.map(file => file.filename);
        const updatedImages = images.length === 3 ? images : productData.images;

        await productHelper.updateProduct(req.body,updatedImages);
        res.redirect('/admin/displayProduct');
    } catch (error) {
        console.log(error.message);
    }
}

const productPage = async ( req, res ) => {
    try{
        const id = req.query.id
        const product = await Product.findOne({ _id : id }).populate('category')
        res.render('product',{product : product})
    }
    catch(error){
        console.log(error);
    }
}



module.exports = {
    displayProduct,
    addProduct,
    createProduct,
    unListProduct,
    reListProduct,
    loadUpdateProduct,
    updateProduct,
    productPage
}