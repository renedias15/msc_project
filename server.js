require('dotenv').config()
const { error } = require('console')
const express = require('express')
const session = require('express-session')
const flash = require('express-flash')
const MongoStore = require('connect-mongo')(session)
const app = express()
const passport = require('passport')
const bodyParser = require('body-parser')
const user = require('./routes/user')
const item = require('./models/item')
const Cart = require('./models/cart')
const orderModel = require('./models/order')

const PORT = process.env.PORT || 5000     //if any other port exists then listen there else 3000
const passportInit = require('./config/passport')

app.use(express.json())
app.use(flash())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/images'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/fonts', express.static(__dirname + 'public/fonts'))

app.set('views', './views')
app.set('view engine', 'ejs')

const dbConfig = require('./config.js');
const mongoose = require('mongoose');
const expressFlash = require('express-flash')
const { Router } = require('express')
const req = require('express/lib/request')

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Successfully connected to the database");
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });
const connection = mongoose.connection
let Store = new MongoStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: Store,
    saveUninitialized: false,
    cookie: { maxAge: 40 * 60 * 1000 }
}))

passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
})
app.listen(5000, () => {
    console.log('listening on 5000')
})
app.get('/', async function (req, res) {
    const food = await item.find()
    return res.render('index', { food: food })
})
app.route("/user")
    .post(user.createUser)
    .get(user.getUser);

app.get('/register', function (req, res) {
    res.render('register')
})
app.get('/login1', function (req, res) {
    res.render('login1')
})
app.get("/addtoCart/:id", function (req, res, next) {
    var itemID = req.params.id
    console.log(req.session.cart)
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} })
    item.findById(itemID, function (err, newitem) {
        if (err) {
            console.log(err)
        }
        else {
            cart.add(newitem, newitem.id)
            req.session.cart = cart
            console.log(req.session.cart)
            res.redirect()
        }
    })
})
app.get("/addOne/:id", function (req, res) {                         
    var itemId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    cart.addItem(itemId);
    req.session.cart = cart;
    res.redirect("/cart");   //put notif here
});
app.get("/removeOne/:id", function (req, res) {                         
    var itemId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    cart.remove(itemId);
    req.session.cart = cart;
    res.redirect("/cart");   //put notif here
});

app.get('/cart', function (req, res) {       
    if (!req.session.cart) {
        res.render('emptycart')             
    }
    else if (req.session.cart == '') {
        res.redirect('/')
    }
    else {
        var fart = new Cart(req.session.cart)
        res.render('cart', { items: fart.generateArray(), totalPrice: fart.totalPrice })
        console.log(req.session.cart.items)
    }
})
app.get('/cart/order', function (req, res) {                 
    if (!req.user) {
        req.flash('success', 'you need to be logged in to order')
        res.redirect('/login1')
    }
    else {
        var fart = new Cart(req.session.cart)
        const orderedItems = new orderModel({
            customerId: req.user.email,
            items: fart.generateArray()
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
app.get('/cart/Cancelorder', async function (req, res) {                //not implemented
    try {
        if (req.session.cache) {
            let x = await orderModel.findOne({}).sort({ date: -1 });
            await x.remove();
            res.status(200).json({ message: "deleted place" })
        }
        else {
            console.log("no order was placed")

        }
    } catch (err) {
        res.json({ message: err });
    }
})
app.get("/orderHistory", async function (req, res, next) {      //not implemented
    try {
        const order = await orderModel.find({ customerId: req.user }, { _id: 0, 'items.item._id': 0, 'items.item.image': 0, 'items.item.price': 0 })
        console.log(order)
        return res.render('order', { order: order })
    } catch (err) {
        res.json({ message: err });
    }

});

