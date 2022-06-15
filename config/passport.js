const req = require('express/lib/request')
const User = require('../models/user')
const Local = require('passport-local').Strategy

function init(passport){
    passport.use(new Local({usernameField:'email'},async(email,password,done)=>{
        const user = await User.findOne({email:email})
        if(!user){
            return done(null,false, {message:"No user with this email found"})
        }
        if(password != user.password){
            return done(null,false,{message:"wrong Username or password"})
        }
        else{
            return done(null,user,{message:"logged in successfully"})
        }
    }))
    passport.serializeUser((user,done)=>{
        done(null,user.email)
    })
    passport.deserializeUser((email,done)=>{
        User.findOne({email:email},(err,user)=>{
            done(err,user)
        })
    })  
    
}

module.exports= init