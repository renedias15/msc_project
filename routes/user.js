require('dotenv').config()
const express=require('express');
const user=require('../models/user')
const passport = require('passport');
const app = express()

function getUser(req, res,next)
{    
    passport.authenticate('local',(err,user,info)=>{
        if(err){
        req.flash('error',info.message)
        return next(err)
        }
    if(!user){
        req.flash('error',info.message)
        console.log("no user found, please register!")
        return res.redirect('/register')
    }
    req.logIn(user,(err)=>{
        if(err){
            req.flash('error',info.message)
            return next(err)
        }
        console.log("logged in successfully")
        return res.redirect('/')
    })
    })(req,res,next)
}

function createUser(req, res)
{
    const x= new user({
        email:req.body.email,
        password:req.body.password,
        password2:req.body.password2,
        address: req.body.address,
        pincode: req.body.pincode,
        phoneNo:req.body.phoneNo,
        landmark:req.body.landmark,
        

    });
        x.save()
        .then(data=>{
            res.status(200)
            return res.redirect('/login1')
        })
    .catch(err=>{
        
    })
        
    
}

module.exports = { createUser, getUser };
