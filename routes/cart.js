const Cart = require('../models/cart')
const item = require('../models/item')
const orderModel =require('../models/order')
const express = require('express')
const router = express.Router()
const session = require('../session')
const app = express()
const passport = require('passport')
const passportInit = require('../config/passport')

passportInit(passport)
router.use(passport.initialize())
router.use(passport.session())

app.use(session.getSessionMiddleware())

router.get("/addtoCart/:id", function (req, res, next) {
    var itemID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    item.findById(itemID, function (err, newitem) {
        if (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            cart.add(newitem, newitem.id);
            req.session.cart = cart;
            console.log(req.session.cart);
            res.status(200).json({ success: true });
        }
    });
});

router.get("/addOne/:id", function (req, res) {                         
    var itemId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    cart.addItem(itemId);
    req.session.cart = cart;
    res.status(200).json({ success: true });
});
router.get("/removeOne/:id", function (req, res) {                         
    var itemId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    cart.remove(itemId);
    req.session.cart = cart;
    res.status(200).json({ success: true });
});

router.get('/cartpage', function (req, res) {       
    if (!req.session.cart) {
        res.render('emptycart', { session: req.session }); 
    } else if (req.session.cart == '') {
        res.redirect('/');
    } else {
        var fart = new Cart(req.session.cart);
        res.render('cart', { items: fart.generateArray(), totalPrice: fart.totalPrice, session: req.session }); 
        console.log(req.session.cart.items);
    }
})
router.get('/cart/order/:long/:lat', function (req, res) {      
    console.log(req.user)           
    if (!req.user) {
        req.flash('success', 'you need to be logged in to order')
        return res.status(400).json({ success: true });
    }
    else {
        var fart = new Cart(req.session.cart)
        const orderedItems = new orderModel({
            customerId: req.user.email,
            items: fart.generateArray(),
            longitude:req.params.long,
            latitude:req.params.lat
        })
        orderedItems.save().then(result => {
            req.flash('success', 'Order placed succesfully')
            req.session.cache = req.session.cart
            delete req.session.cart
            setTimeout(function() {   
                   return res.redirect('/')
            }, 4000);    
        }).catch(err => {
            req.flash('error', 'something went wrong')
        })
    }

})

module.exports = router
