require('dotenv').config()
const express = require('express')
const flash = require('express-flash')
const app = express()
// const passport = require('passport')
const bodyParser = require('body-parser')
const user = require('./routes/user')
const item = require('./models/item')
const session = require('./session')

const PORT = process.env.PORT || 3300     //if any other port exists then listen there else 3000
// const passportInit = require('./config/passport')

app.use(express.json())
app.use(flash())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/images'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/fonts', express.static(__dirname + 'public/fonts'))
app.use(session.getSessionMiddleware())
app.use('/cart', require('./routes/cart'))
app.use('/cart', express.static('public'));

app.set('views', './views')
app.set('view engine', 'ejs')

const dbConfig = require('./config/config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
})
    .then(() => {
        console.log("Successfully connected to the database");
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });

// passportInit(passport)
// app.use(passport.initialize())
// app.use(passport.session())


app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
})
app.listen(3300, () => {
    console.log('listening on 3300')
})
app.get('/', async function (req, res) {
    const food = await item.find()
    // console.log(food)
    return res.render('index', { food: food })
})
app.route("/user")
    .post(user.createUser)
    .get(user.getUser);

app.get('/register', function (req, res) {
    res.render('register')
})
app.get('/login', function (req, res) {
    res.render('login1')
})

// app.get('/cart/Cancelorder', async function (req, res) {                //not implemented
//     try {
//         if (req.session.cache) {
//             let x = await orderModel.findOne({}).sort({ date: -1 });
//             await x.remove();
//             res.status(200).json({ message: "deleted place" })
//         }
//         else {
//             console.log("no order was placed")

//         }
//     } catch (err) {
//         res.json({ message: err });
//     }
// })
// app.get("/orderHistory", async function (req, res, next) {      //not implemented
//     try {
//         const order = await orderModel.find({ customerId: req.user }, { _id: 0, 'items.item._id': 0, 'items.item.image': 0, 'items.item.price': 0 })
//         console.log(order)
//         return res.render('order', { order: order })
//     } catch (err) {
//         res.json({ message: err });
//     }

// });

