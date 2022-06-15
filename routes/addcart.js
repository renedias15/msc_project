const express=require('express')
const Cart =require('../models/cart')
const item =require('../models/item')
const app = express()
const session = require('express-session')
const mongoose = require('mongoose');
const MongoStore= require('connect-mongo')(session)
const flash=require('express-flash')
app.use(flash())
const connection=mongoose.connection
let Store = new MongoStore({
    mongooseConnection:connection,
    collection:'sessions'
})

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store:Store,
    saveUninitialized: false,
    cookie: {maxAge:20* 60 * 1000}
}))

function addtocart(req,res,next)
{
    
    var itemID = req.params.id
    var cart =new Cart(req.session.cart ? req.session.cart : {items:{}})
    item.findById(itemID,function(err,item){
        if(err)
        {
            console.log(err)
        }
        cart.add(item,item.id)
        res.session.cart=cart 
         console.log(cart)
    })
}
module.exports = {addtocart};