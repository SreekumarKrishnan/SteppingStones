const { resolve } = require('path');
const Product = require('../models/productModel');
const { log } = require('console');

const createProduct = (data,images)=>{
    return new Promise((resolve,reject)=>{
        const newProduct = new Product({
            name:data.name,
            description:data.description,
            images:images,
            category:data.category,
            price:data.price,
            stock:data.stock

        });
        newProduct.save()
        .then((newProduct)=>{
            resolve(newProduct);
        })
        .catch((err)=>{
            reject(err);
        });

    });
};

const unListProduct = (data)=>{
    return new Promise(async (resolve,reject)=>{
        const id = data;
        await Product.updateOne({_id:id},{isProductListed:false})
        .then(()=>{
            resolve();
        })
        .catch((error)=>{
            reject(error)
        });
    });
};

const reListProduct = (data)=>{
    
 

    return new Promise(async (resolve,reject)=>{
        const id =data;
        const categoryListed = await Product.findOne({_id:id}).populate('category');
        if(categoryListed.category.isListed===true){
            await Product.updateOne({_id:id},{isProductListed:true})
            .then(()=>{
                resolve();
            })
            .catch((error)=>{
                reject(error);
            });
        }else{
            console.log("Cannot relist");
        }



    })

}

const updateProduct = async (data,images)=>{
    try {
        
            await Product.updateOne(
            {_id:data.id},
            {$set:{
            name:data.name,
            description:data.description,
            images:images,
            category:data.category,
            price:data.price,
            stock:data.stock
            }}
            );
            
    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    createProduct,
    unListProduct,
    reListProduct,
    updateProduct
}