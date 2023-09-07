const { resolve } = require('path');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const { error } = require('console');

const createCategory = (data)=>{
    return new Promise(async(resolve,reject)=>{
        const name =data.name.toUpperCase();
        const category = new Category({name:name,description:data.description});
        category.save()
        .then((savedCategory)=>{
            resolve(savedCategory);
        })
        .catch((error)=>{
            reject(error);
        });
    });
};

const unListCategory = async (categoryId)=>{
    try {
        await Category.findByIdAndUpdate(categoryId,{isListed:false});
        await Product.updateMany({category:categoryId},{$set:{isListed:false}});
    } catch (error) {
        console.log(error.message);
    }
    
    
}

const reListCategory = async (categoryId)=>{
    try {
        await Category.findByIdAndUpdate(categoryId,{isListed:true});
        await Product.updateMany({category:categoryId},{$set:{isListed:true}});
    } catch (error) {
        console.log(error.message);
    }
}

const loadUpdateCategory = (id)=>{
    return new Promise(async (resolve,reject)=>{
        await Category.findById(id)
        .then((categoryData)=>{
            resolve(categoryData);
        })
        .catch((error)=>{
            reject(error);
        });
    });
};

const updateCategory = async (id,data)=>{
    try {
        await Category.findByIdAndUpdate(id,{$set:{name:data.name,description:data.description}});

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    createCategory,
    unListCategory,
    reListCategory,
    loadUpdateCategory,
    updateCategory
}