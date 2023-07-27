const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const { error } = require('console');
require('dotenv').config();

const maxAge = 3*24*60*60;
const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET_KEY,{
        expiresIn:maxAge
    });
};

const verifyLogin = (data)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({email:data.email})
        .then((userData)=>{
            if(userData){
                bcrypt.compare(data.password,userData.password)
                .then((passwordMatch)=>{
                    if(passwordMatch){
                        if(userData.is_blocked){
                            resolve({error:"Your account id blocked"});
                        }else{
                            const token = createToken(userData._id);
                            resolve({token});
                        }
                    }else{
                        resolve({error:"Email and password are incorrect"});
                    }
                   
                })
                .catch((error)=>{
                    reject(error);
                })
            }else{
                resolve({error:"Email and password are incorrect"});
            }
            
        })
        .catch((error)=>{
            reject(error);
        })
    })

    }

    module.exports ={
        verifyLogin
    }

