const Category = require('../models/categoryModel');
const categoryHelper = require('../helpers/categoryHelper');


const loadCategory = async(req,res)=>{
    try {
       const categories = await Category.find();
       res.render('category',{categories}); 
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCategory = async (req,res)=>{
    try {
        res.render('addCategory');
    } catch (error) {
        console.log(error.message);
    }
}

const createCategory = async(req,res)=>{
    try {
        const existingCategory = await Category.findOne({name:req.body.name});
        if(existingCategory){
            return res.render('addCategory',{message:"Category already exists"});
        }
        if(!req.body.name||req.body.name.trim().length===0){
            return res.render('addCategory',{message:"Category name is required"});
        }
        const data = await categoryHelper.createCategory(req.body);
        console.log(data);
        res.redirect('/admin/category');

    } catch (error) {
        console.log(error.message);

    }
}

const unListCategory = async (req,res)=>{
    try {
        await categoryHelper.unListCategory(req.query.id);
        res.redirect('/admin/category');

    } catch (error) {
       console.log(error.message); 
    }
}

const reListCategory = async (req,res)=>{
    try {
        await categoryHelper.reListCategory(req.query.id);
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
    }
}

const  loadUpdateCategory = async (req,res)=>{
    try {
        const id = req.query.id;
        const categoryData = await categoryHelper.loadUpdateCategory(id);
        res.render('updateCategory',{category:categoryData});

    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req,res)=>{
    try {
        const id = req.body.id;
        await categoryHelper.updateCategory(id,req.body);
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCategory,
    loadAddCategory,
    createCategory,
    unListCategory,
    reListCategory,
    loadUpdateCategory,
    updateCategory
}